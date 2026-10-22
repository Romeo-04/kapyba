import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KapyBa",
    short_name: "KapyBa",
    description: "Rate dishes in two taps. Cook what sells.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0eb",
    theme_color: "#7a4a30",
    lang: "fil",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
