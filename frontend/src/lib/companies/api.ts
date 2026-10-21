import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { ApiError, apiPublicFetch } from "@/lib/api/server";
import type { PublicCompany, Wrapped } from "@/lib/api/types";

/**
 * 企業ページ(募集中の求人を含む)。見つからない場合はnull。
 * 企業が編集したときはタグで即時に再検証するため、時間での再検証は長めにする
 */
export async function getCompany(id: number): Promise<PublicCompany | null> {
  "use cache";
  cacheLife("hours");
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
