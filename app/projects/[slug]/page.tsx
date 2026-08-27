// ...existing code...
import { client } from "@/sanity/client";
import { projectBySlugQuery, projectsQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import ProjectDetailClient from "./ProjectDetailClient";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const projects = await client.fetch(projectsQuery);
    return projects?.map((p: any) => ({ slug: p.slug?.current })) || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const project = await client.fetch(projectBySlugQuery, { slug });
    return {
      title: project ? `${project.title} - Abdallah Ahmed` : "Project - Abdallah Ahmed",
      description: project?.title
        ? `${project.title} - A project by Abdallah Ahmed, Graphic Designer`
        : "Project by Abdallah Ahmed",
    };
  } catch {
    return {
      title: "Project - Abdallah Ahmed",
    };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let project;
  try {
    project = await client.fetch(projectBySlugQuery, { slug });
  } catch {
    project = null;
  }

  if (!project) {
    notFound();
  }

  const coverUrl = project.coverImage
    ? urlFor(project.coverImage).width(1920).height(1080).format("webp").url()
    : null;

  // generate gallery items with computed height to preserve original aspect ratio
  const galleryItems = project.gallery
    ? project.gallery.map((img: any) => {
      // try common locations for dimensions
      const asset = img?.asset || img;
      let origW = asset?.metadata?.dimensions?.width || img?.metadata?.dimensions?.width;
      let origH = asset?.metadata?.dimensions?.height || img?.metadata?.dimensions?.height;

      // fallback: parse from asset._ref like "image-<id>-<width>x<height>-png"
      const ref = asset?._ref || asset?._id || asset?.asset?._ref;
      if ((!origW || !origH) && typeof ref === "string") {
        const m = ref.match(/-(\d+)x(\d+)-/);
        if (m) {
          origW = origW || parseInt(m[1], 10);
          origH = origH || parseInt(m[2], 10);
        }
      }

      // target width for generated image (keeps file size reasonable)
      const targetW = 1080;

      let targetH: number;
      if (origW && origH) {
        targetH = Math.max(1, Math.round((targetW * origH) / origW));
      } else {
        // fallback to common aspect ratios you mentioned: prefer 4:5 or 1:1
        // try to detect from img._key or filename if available (optional)
        // default to 4:5
        targetH = Math.round((targetW * 5) / 4);
      }

      const src = urlFor(img).width(targetW).height(targetH).format("webp").url();
      return {
        src,
        width: targetW,
        height: targetH,
        // keep original if available
        origWidth: origW || null,
        origHeight: origH || null,
      };
    })
    : [];

  return (
    <ProjectDetailClient
      project={project}
      coverUrl={coverUrl}
      galleryItems={galleryItems}
    />
  );
}
// ...existing code...