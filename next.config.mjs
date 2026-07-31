/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required later (Step 3) for pdfjs-dist worker resolution
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
