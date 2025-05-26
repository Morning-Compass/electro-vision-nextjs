/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  output: "export",
  devIndicators: false,
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      const ReactDevOverlay = config.entry;
      if (typeof config.entry === "function") {
        config.entry = async () => {
          const entries = await ReactDevOverlay();
          delete entries["main.js"]; // optionally block overlay injection
          return entries;
        };
      }
    }
    return config;
  },
};

export default nextConfig;
