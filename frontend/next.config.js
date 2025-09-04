/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/api/v1",
    NEXT_PUBLIC_GRAPHQL_URL:
      process.env.NEXT_PUBLIC_GRAPHQL_URL ||
      "http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/graphql",
  },
};

module.exports = nextConfig;
