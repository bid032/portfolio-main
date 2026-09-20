import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abdallah Ahmed - Senior Graphic Designer & Web Developer",
    short_name: "Abdallah Ahmed",
    description:
      "Official Portfolio of Abdallah Ahmed - Senior Graphic Designer & Web Developer specializing in Visual Identity, Web Development, UI/UX Design, and 3D Photo Manipulation.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#f57f00",
    icons: [
      {
        src: "/Photos/Logo/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/Photos/Logo/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
