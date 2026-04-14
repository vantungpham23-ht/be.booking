/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages + @cloudflare/next-on-pages: không có image optimizer Node
  ...(process.env.CF_PAGES === "1" ? { images: { unoptimized: true } } : {}),

  /**
   * Tắt persistent webpack cache ở dev — giảm lỗi "Cannot find module './NNN.js'" khi chunk đổi
   * sau Fast Refresh / đổi nhánh (cache .next / webpack lệch).
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;

