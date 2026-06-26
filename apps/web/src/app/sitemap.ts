import type { MetadataRoute } from "next";

// Required for `output: "export"` (static export) so Next 16 emits sitemap.xml
// as a static file rather than a dynamic route handler.
export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://meshysmith.app";
const LAST_MODIFIED = new Date("2026-06-26T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/app`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
