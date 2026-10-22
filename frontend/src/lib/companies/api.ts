import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { ApiError, apiPublicFetch } from "@/lib/api/server";
import type { PublicCompany, Wrapped } from "@/lib/api/types";

/** 求人一覧・求人詳細とそろえ、編集・求人の公開・いいね数の反映を最大5分遅らせる */
const COMPANY_REVALIDATE_SECONDS = 300;

/**
 * 企業ページ(募集中の求人を含む)。見つからない場合はnull。
 * Laravelからの再検証の通知はまだないため、時間での再検証(5分)だけで更新する
 */
export async function getCompany(id: number): Promise<PublicCompany | null> {
  "use cache";
  cacheLife({ revalidate: COMPANY_REVALIDATE_SECONDS });
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
