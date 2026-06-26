import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const extraAllowedDevOrigins = (process.env.MESHYSMITH_ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["localhost", "127.0.0.1", ...extraAllowedDevOrigins],
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? "true" : "false",
  },
  images: {
    unoptimized: true
  },
  ...(isStaticExport
    ? {
        output: "export" as const,
        trailingSlash: true,
        assetPrefix: "./",
      }
    : {}),
};

export default nextConfig;
