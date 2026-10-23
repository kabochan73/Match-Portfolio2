import { queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";

/** 通知を受け取る側(APIのパスの先頭) */
export type NotifiableRole = "seeker" | "company";

/**
 * 未読の通知の数(ヘッダーのベルのバッジ用)。求職者・企業で共通
 */
export function unreadCountQueryOptions(role: NotifiableRole) {
  return queryOptions({
    queryKey: ["notifications", role, "unread-count"],
    queryFn: async () => {
      const { data } = await apiClientFetch<{ data: { unread_count: number } }>(
        `/${role}/notifications/unread-count`,
      );

      return data.unread_count;
    },
  });
}
