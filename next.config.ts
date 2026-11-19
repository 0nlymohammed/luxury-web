import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds the public site into ./out for GitHub Pages.
// Unset, the app runs as a normal Next server with the admin CMS.
const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "1"
    ? { output: "export" as const, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
