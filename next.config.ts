import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // content/ is read with fs at render time; make sure serverless bundles include it
  outputFileTracingIncludes: {
    "/**": ["./content/**/*.md", "./content/**/*.json"],
  },
  images: {
    qualities: [75, 85],
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/units/**", search: "" },
      { pathname: "/brand/**", search: "" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
