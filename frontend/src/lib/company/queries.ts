import { queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";
import type {
  CompanyJobPosting,
  CompanyJobPostingList,
  Wrapped,
} from "@/lib/api/types";

/**
 * 企業の管理画面で使う取得(ブラウザからTanStack Queryで呼ぶ)。
 * キーは["company", ...]で始め、ログアウト時の消去や、更新後の再取得をまとめて扱えるようにする。
 * 求人の一覧と個別の求人は同じ["company", "job-postings"]から始め、更新したら両方をまとめて取り直す
 */
export const companyQueryKeys = {
  jobPostings: ["company", "job-postings"] as const,
  jobPosting: (id: number) => ["company", "job-postings", id] as const,
};

/** 自社の求人の一覧(公開中の件数と上限を含む) */
export function companyJobPostingsQueryOptions() {
  return queryOptions({
    queryKey: companyQueryKeys.jobPostings,
    queryFn: () =>
      apiClientFetch<CompanyJobPostingList>("/company/job-postings"),
  });
}

/** 自社の求人1件(職種・技術スタック・画像を含む) */
export function companyJobPostingQueryOptions(id: number) {
  return queryOptions({
    queryKey: companyQueryKeys.jobPosting(id),
    queryFn: async () => {
      const { data } = await apiClientFetch<Wrapped<CompanyJobPosting>>(
        `/company/job-postings/${id}`,
      );

      return data;
    },
  });
}
