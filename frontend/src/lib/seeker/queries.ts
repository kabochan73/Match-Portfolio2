import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";
import type {
  Bookmark,
  JobMyStatus,
  LikeQuota,
  LikeTab,
  Paginated,
  SeekerLike,
  SeekerLikeList,
  SeekerProfile,
  Wrapped,
} from "@/lib/api/types";

/**
 * 求職者の画面で使う取得(ブラウザからTanStack Queryで呼ぶ)。
 * キーは["seeker", ...]で始め、いいね・ブックマークのあとにまとめて取り直せるようにする
 */
export const seekerQueryKeys = {
  all: ["seeker"] as const,
  myStatus: (jobPostingId: number) =>
    ["seeker", "job-postings", jobPostingId, "my-status"] as const,
  likeQuota: ["seeker", "like-quota"] as const,
  likes: (status: LikeTab, page: number) =>
    ["seeker", "likes", "list", status, page] as const,
  like: (id: number) => ["seeker", "likes", id] as const,
  bookmarks: (page: number) => ["seeker", "bookmarks", page] as const,
  profile: ["seeker", "profile"] as const,
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

/** 応募状況(タブ・ページごと)。切り替える間は前の一覧を出したままにする */
export function seekerLikesQueryOptions(status: LikeTab, page: number) {
  return queryOptions({
    queryKey: seekerQueryKeys.likes(status, page),
    queryFn: () =>
      apiClientFetch<SeekerLikeList>(
        `/seeker/likes?status=${status}&page=${page}`,
      ),
    placeholderData: keepPreviousData,
  });
}

/** 自分のいいね1件(志望動機・応募先の求人) */
export function seekerLikeQueryOptions(id: number) {
  return queryOptions({
    queryKey: seekerQueryKeys.like(id),
    queryFn: async () => {
      const { data } = await apiClientFetch<Wrapped<SeekerLike>>(
        `/seeker/likes/${id}`,
      );

      return data;
    },
  });
}

/** ブックマーク一覧(ブックマークした新しい順) */
export function bookmarksQueryOptions(page: number) {
  return queryOptions({
    queryKey: seekerQueryKeys.bookmarks(page),
    queryFn: () =>
      apiClientFetch<Paginated<Bookmark>>(`/seeker/bookmarks?page=${page}`),
    placeholderData: keepPreviousData,
  });
}

/** 自分のプロフィール(職歴・学歴・資格を含む)。自分の操作でしか変わらないため、更新したときだけ取り直す */
export function seekerProfileQueryOptions() {
  return queryOptions({
    queryKey: seekerQueryKeys.profile,
    queryFn: async () => {
      const { data } =
        await apiClientFetch<Wrapped<SeekerProfile>>("/seeker/profile");

      return data;
    },
    staleTime: Infinity,
  });
}
