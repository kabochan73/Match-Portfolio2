import { queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";
import type { CompanyJobPostingList } from "@/lib/api/types";

/**
 * 企業の管理画面で使う取得(ブラウザからTanStack Queryで呼ぶ)。
 * キーは["company", ...]で始め、ログアウト時の消去や、更新後の再取得をまとめて扱えるようにする
 */
export const companyQueryKeys = {
  jobPostings: ["company", "job-postings"] as const,
};

/** 自社の求人の一覧(公開中の件数と上限を含む) */
export function companyJobPostingsQueryOptions() {
  return queryOptions({
    queryKey: companyQueryKeys.jobPostings,
    queryFn: () =>
      apiClientFetch<CompanyJobPostingList>("/company/job-postings"),
  });
}
