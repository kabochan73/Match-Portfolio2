import "server-only";

import { cache } from "react";

import { ApiError } from "@/lib/api/errors";
import { apiAuthFetch } from "@/lib/api/server";
import type { Seeker, Wrapped } from "@/lib/api/types";
import { hasSessionCookie } from "@/lib/auth/session";

/**
 * ログイン中の求職者。未ログイン(企業でログイン中を含む)ならnull。
 * 1回の表示の中で何度呼んでも、APIを呼ぶのは1回だけ(ヘッダーと認証ガードの両方で使うため)
 */
export const getCurrentSeeker = cache(async (): Promise<Seeker | null> => {
  if (!(await hasSessionCookie())) {
    return null;
  }

  try {
    const { data } = await apiAuthFetch<Wrapped<Seeker>>("/seeker/me");

    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
});
