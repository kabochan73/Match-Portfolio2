import "server-only";

import { cache } from "react";

import { ApiError } from "@/lib/api/errors";
import { apiAuthFetch } from "@/lib/api/server";
import type { Company, Wrapped } from "@/lib/api/types";
import { hasSessionCookie } from "@/lib/auth/session";

/**
 * ログイン中の企業。未ログイン(求職者でログイン中を含む)ならnull。
 * 1回の表示の中で何度呼んでも、APIを呼ぶのは1回だけ
 */
export const getCurrentCompany = cache(async (): Promise<Company | null> => {
  if (!(await hasSessionCookie())) {
    return null;
  }

  try {
    const { data } = await apiAuthFetch<Wrapped<Company>>("/company/me");

    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
});
