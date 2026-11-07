// Static export: `next build` writes plain HTML/JS to `out/`, so any static host works.
// There is no server code. Sync happens between browsers (see README).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  reactStrictMode: false,
};

export default nextConfig;
