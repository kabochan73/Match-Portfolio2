import { queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";
import type { JobMyStatus, LikeQuota, Wrapped } from "@/lib/api/types";

/**
 * 求職者の画面で使う取得(ブラウザからTanStack Queryで呼ぶ)。
 * キーは["seeker", ...]で始め、いいね・ブックマークのあとにまとめて取り直せるようにする
 */
export const seekerQueryKeys = {
  all: ["seeker"] as const,
  myStatus: (jobPostingId: number) =>
    ["seeker", "job-postings", jobPostingId, "my-status"] as const,
  likeQuota: ["seeker", "like-quota"] as const,
};

/**
 * 求人に対する自分の状況(ブックマーク済みか・最新のいいね)。求人詳細のボタン用。
 * 求人詳細は全員で同じキャッシュを使うため、自分の状況はブラウザで別に取る
 */
export function myStatusQueryOptions(jobPostingId: number) {
  return queryOptions({
    queryKey: seekerQueryKeys.myStatus(jobPostingId),
    queryFn: async () => {
      const { data } = await apiClientFetch<Wrapped<JobMyStatus>>(
        `/seeker/job-postings/${jobPostingId}/my-status`,
      );

      return data;
    },
  });
}

/** 今月のいいねの残り回数 */
export function likeQuotaQueryOptions() {
  return queryOptions({
    queryKey: seekerQueryKeys.likeQuota,
    queryFn: async () => {
      const { data } =
        await apiClientFetch<Wrapped<LikeQuota>>("/seeker/like-quota");

      return data;
    },
  });
}
