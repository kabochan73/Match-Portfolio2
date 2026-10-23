import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";
import type { AppNotification, Paginated } from "@/lib/api/types";

/** 通知を受け取る側(APIのパスの先頭) */
export type NotifiableRole = "seeker" | "company";

/** 通知一覧(GET /api/{role}/notifications)。未読の数を含む */
export type NotificationList = Paginated<AppNotification> & {
  meta: { unread_count: number };
};

/**
 * 通知のキー。["notifications", role]で始め、既読にしたら一覧と未読数をまとめて取り直す
 */
export const notificationQueryKeys = {
  all: (role: NotifiableRole) => ["notifications", role] as const,
  unreadCount: (role: NotifiableRole) =>
    ["notifications", role, "unread-count"] as const,
  list: (role: NotifiableRole, page: number) =>
    ["notifications", role, "list", page] as const,
};

/**
 * 未読の通知の数(ヘッダーのベルのバッジ用)。求職者・企業で共通
 */
export function unreadCountQueryOptions(role: NotifiableRole) {
  return queryOptions({
    queryKey: notificationQueryKeys.unreadCount(role),
    queryFn: async () => {
      const { data } = await apiClientFetch<{ data: { unread_count: number } }>(
        `/${role}/notifications/unread-count`,
      );

      return data.unread_count;
    },
  });
}

/**
 * 通知の一覧(新しい順、ページごと)。ページを切り替える間は前の一覧を出したままにする
 */
export function notificationsQueryOptions(role: NotifiableRole, page: number) {
  return queryOptions({
    queryKey: notificationQueryKeys.list(role, page),
    queryFn: () =>
      apiClientFetch<NotificationList>(`/${role}/notifications?page=${page}`),
    placeholderData: keepPreviousData,
  });
}
