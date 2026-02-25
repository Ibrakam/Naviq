import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep tracing inside frontend workspace when monorepo/root has another lockfile.
  outputFileTracingRoot: process.cwd(),
  // Isolate build artifacts from potentially corrupted default .next cache.
  distDir: ".next-app",
};

export default nextConfig;
