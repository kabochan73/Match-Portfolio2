import type { NextConfig } from "next";

// LaravelのURL(Next.jsのサーバーから見たもの)。Docker内ではhttp://app:8080
const apiInternalUrl = process.env.API_INTERNAL_URL;

if (!apiInternalUrl) {
  throw new Error("環境変数API_INTERNAL_URLが設定されていません");
}

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // ブラウザからのAPI呼び出しを、同じドメインの/api・/sanctum経由でLaravelへ中継する。
  // Railwayの*.up.railway.appではフロントとバックエンドが別サイト扱いになり、
  // ログインのCookieが送られないため、ブラウザから見て同じサイトになるようにしている
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/api/:path*`,
      },
      {
        source: "/sanctum/:path*",
        destination: `${apiInternalUrl}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
