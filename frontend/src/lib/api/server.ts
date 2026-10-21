import "server-only";

import { apiInternalUrl } from "./config";

/**
 * APIがエラー(2xx以外)を返したときの例外。画面側でステータスを見て出し分ける(404ならnotFound()等)
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 公開ページ用のAPI呼び出し(Server Componentから使う)。
 * Cookieを送らないため、'use cache'の中でも使える(キャッシュは全員で共有されるため、Cookieを読んではいけない)
 *
 * @param path "/jobs"のような/api以降のパス
 */
export async function apiPublicFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${apiInternalUrl()}/api${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `APIの呼び出しに失敗しました(${response.status} ${path})`,
    );
  }

  return response.json() as Promise<T>;
}
