import type { NextConfig } from "next";

// LaravelのURL(Next.jsのサーバーから見たもの)。Docker内ではhttp://app:8080
const apiInternalUrl = process.env.API_INTERNAL_URL;

if (!apiInternalUrl) {
  throw new Error("環境変数API_INTERNAL_URLが設定されていません");
}

const nextConfig: NextConfig = {
  // Cache Components(Next.js 16の推奨のキャッシュ方式)。'use cache'でキャッシュする部分と、
  // <Suspense>の中でリクエストごとに描画する部分(ログイン状態など)を、1つのページの中で分けられる
  cacheComponents: true,
  // リンクの先読みで、各ページの静的な骨組みを取得する(cacheComponentsとセットで明示する必要がある)
  partialPrefetching: true,
  images: {
    // 画像はLaravelがアップロード時に縮小・WebP化しているため、Next.jsでは最適化しない。
    // (開発中の画像URLはlocalhostで、Next.jsの画像最適化はローカルIPからの取得を既定で拒否する)
    unoptimized: true,
  },
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
