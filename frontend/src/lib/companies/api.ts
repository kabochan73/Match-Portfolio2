import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { ApiError } from "@/lib/api/errors";
import { apiPublicFetch } from "@/lib/api/server";
import type { PublicCompany, Wrapped } from "@/lib/api/types";

/**
 * 企業ページ(募集中の求人を含む)。見つからない場合はnull。
 * 企業ページの編集・求人の変更・いいねのときにLaravelから通知が届き、company-{id}のタグで作り直す。
 * 通知が届かなかったときの保険として、1日たったら作り直す
 */
export async function getCompany(id: number): Promise<PublicCompany | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`company-${id}`);

  try {
    const { data } = await apiPublicFetch<Wrapped<PublicCompany>>(
      `/companies/${id}`,
    );

    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
