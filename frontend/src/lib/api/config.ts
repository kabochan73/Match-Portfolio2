import "server-only";

/**
 * Next.jsのサーバーから見たLaravelのURL(Docker内ではhttp://app:8080)。
 * ブラウザからは同じドメインの/apiをrewritesで中継するため、ブラウザ側では使わない
 */
export function apiInternalUrl(): string {
  const url = process.env.API_INTERNAL_URL;

  if (!url) {
    throw new Error("環境変数API_INTERNAL_URLが設定されていません");
  }

  return url;
}
