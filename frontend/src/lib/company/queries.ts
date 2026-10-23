import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";
import type {
  Company,
  CompanyJobPosting,
  CompanyJobPostingList,
  LikeTab,
  ReceivedLike,
  ReceivedLikeList,
  Wrapped,
} from "@/lib/api/types";

/** 応募者一覧の絞り込み(URLのクエリと同じもの) */
export type ReceivedLikesFilter = {
  status: LikeTab;
  jobPostingId: number | null;
  page: number;
};

/**
 * 企業の管理画面で使う取得(ブラウザからTanStack Queryで呼ぶ)。
 * キーは["company", ...]で始め、ログアウト時の消去や、更新後の再取得をまとめて扱えるようにする。
 * 一覧と個別のものは同じキーから始め、更新したら両方をまとめて取り直す
 */
export const companyQueryKeys = {
  profile: ["company", "profile"] as const,
  jobPostings: ["company", "job-postings"] as const,
  jobPosting: (id: number) => ["company", "job-postings", id] as const,
  likes: ["company", "likes"] as const,
  likeList: (filter: ReceivedLikesFilter) =>
    ["company", "likes", "list", filter] as const,
  like: (id: number) => ["company", "likes", id] as const,
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

/**
 * 応募者一覧(タブ・求人・ページごと)。タブやページを切り替える間は、前の一覧を出したままにする
 */
export function receivedLikesQueryOptions(filter: ReceivedLikesFilter) {
  const query = new URLSearchParams({
    status: filter.status,
    page: String(filter.page),
  });

  if (filter.jobPostingId) {
    query.set("job_posting_id", String(filter.jobPostingId));
  }

  return queryOptions({
    queryKey: companyQueryKeys.likeList(filter),
    queryFn: () =>
      apiClientFetch<ReceivedLikeList>(`/company/likes?${query.toString()}`),
    placeholderData: keepPreviousData,
  });
}

/** 応募者1人(プロフィール全体と志望動機) */
export function receivedLikeQueryOptions(id: number) {
  return queryOptions({
    queryKey: companyQueryKeys.like(id),
    queryFn: async () => {
      const { data } = await apiClientFetch<Wrapped<ReceivedLike>>(
        `/company/likes/${id}`,
      );

      return data;
    },
  });
}

/** 自社の企業ページ(全項目と、技術スタック・働き方・写真) */
export function companyProfileQueryOptions() {
  return queryOptions({
    queryKey: companyQueryKeys.profile,
    queryFn: async () => {
      const { data } =
        await apiClientFetch<Wrapped<Company>>("/company/profile");

      return data;
    },
  });
}
