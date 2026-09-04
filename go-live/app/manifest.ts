import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Go-Live — Instant Anycast Subdomains",
    short_name: "Go-Live",
    description: "Instant, Globally-Distributed Anycast Subdomains for Developers.",
    start_url: "/",
    display: "standalone",
    background_color: "#14181b",
    theme_color: "#14181b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
