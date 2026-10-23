import "server-only";

import { cookies } from "next/headers";

import { apiInternalUrl, siteUrl } from "./config";
import { ApiError } from "./errors";

/**
 * 公開ページ用のAPI呼び出し(Server Componentから使う)。
 * Cookieを送らないため、'use cache'の中でも使える(キャッシュは全員で共有されるため、Cookieを読んではいけない)
 *
 * @param path "/jobs"のような/api以降のパス
 */
export async function apiPublicFetch<T>(path: string): Promise<T> {
  return request<T>(path, { Accept: "application/json" });
}

/**
 * ログイン中の人として呼ぶAPI(Server Componentから使う)。ブラウザから届いたCookieをLaravelへ転送する。
 * Cookieを読むため'use cache'の中では使えず、呼び出す部分は<Suspense>で囲む
 *
 * @param path "/seeker/me"のような/api以降のパス
 * @throws ApiError 未ログインなら401
 */
export async function apiAuthFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();

  return request<T>(path, {
    Accept: "application/json",
    Cookie: cookieStore.toString(),
    // LaravelのSanctumは、Originが許可したドメインのときだけCookieのセッションでログイン中と判定する。
    // ブラウザと違ってサーバーからのfetchにはOriginが付かないため、明示しないと常に401になる
    Origin: siteUrl(),
  });
}

async function request<T>(
  path: string,
  headers: Record<string, string>,
): Promise<T> {
  const response = await fetch(`${apiInternalUrl()}/api${path}`, { headers });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `APIの呼び出しに失敗しました(${response.status} ${path})`,
    );
  }

  return response.json() as Promise<T>;
}
