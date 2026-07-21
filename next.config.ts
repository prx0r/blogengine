import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  ...(isGithubPages && {
    output: "export",
    basePath: "/blogengine",
    assetPrefix: "/blogengine/",
    trailingSlash: true,
  }),
  images: {
    ...(isGithubPages && { unoptimized: true }),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  ...(!isGithubPages && {
    async rewrites() {
      return [
        {
          source: "/go/:path*",
          destination: "https://opencode.ai/zen/go/:path*",
        },
      ];
    },
  }),
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}
