import { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { projectsQuery } from "@/sanity/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bid032.com";

  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const projects = await client.fetch(projectsQuery);
    projectRoutes = projects.map((project: { slug?: { current?: string }; _updatedAt?: string }) => ({
      url: `${baseUrl}/projects/${project.slug?.current}`,
      lastModified: project._updatedAt ? new Date(project._updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching projects for sitemap:", error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ];

  return [...staticRoutes, ...projectRoutes];
}
