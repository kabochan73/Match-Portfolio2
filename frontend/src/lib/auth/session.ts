import "server-only";

import { cookies } from "next/headers";

/**
 * LaravelのセッションのCookie名(LaravelのAPP_NAMEから作られる。backend/config/session.phpのcookie)
 */
const SESSION_COOKIE = "tech-match-session";

/**
 * セッションのCookieがあるか。初めて来た人などCookieがなければ、APIに問い合わせるまでもなく未ログインと分かる
 * (Cookieがあってもログイン中とは限らないため、ログイン中かどうかは/meのAPIで確かめる)
 */
export async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();

  return cookieStore.has(SESSION_COOKIE);
}
