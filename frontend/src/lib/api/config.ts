import "server-only";

/**
 * Next.jsのサーバーから見たLaravelのURL(Docker内ではhttp://app:8080)。
 * ブラウザからは同じドメインの/apiをrewritesで中継するため、ブラウザ側では使わない
 */
export function apiInternalUrl(): string {
  return requireEnv("API_INTERNAL_URL");
}

/**
 * このサイト(Next.js)自身のURL。サーバーからLaravelを呼ぶときのOriginヘッダーに使う
 * (LaravelのSANCTUM_STATEFUL_DOMAINSに含まれている必要がある)
 */
export function siteUrl(): string {
  return requireEnv("SITE_URL");
}

/**
 * Laravelからの再検証の通知(/internal/revalidate)の合言葉。LaravelのREVALIDATE_SECRETと同じ値にする
 */
export function revalidateSecret(): string {
  return requireEnv("REVALIDATE_SECRET");
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`環境変数${name}が設定されていません`);
  }

  return value;
}
