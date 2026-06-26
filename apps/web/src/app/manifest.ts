import type { MetadataRoute } from "next";

// Required for `output: "export"` (static export) so Next 16 emits this as a
// static file instead of treating it as a dynamic route handler.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeshySmith — 3D design editor",
    short_name: "MeshySmith",
    description: "Free, open-source, local-first 3D design editor. Drop primitives, fillet, chamfer, boolean ops, STL import/export. Web, Electron, Docker.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#0f1620",
    theme_color: "#0098c7",
    orientation: "landscape",
    categories: ["productivity", "graphics", "education"],
    icons: [
      { src: "/icon.png", sizes: "1020x1020", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "1020x1020", type: "image/png", purpose: "any" },
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
  };
}
