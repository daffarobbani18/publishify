import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Allow localhost untuk development
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    // Unoptimized untuk development dengan localhost
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
