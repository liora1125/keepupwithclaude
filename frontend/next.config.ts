import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.ytimg.com" },
      { hostname: "ph-files.imgix.net" },
      { hostname: "ph-avatars.imgix.net" },
    ],
  },
};

export default nextConfig;
