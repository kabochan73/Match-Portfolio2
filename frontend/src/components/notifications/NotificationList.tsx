"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FormAlert } from "@/components/ui/FormAlert";
import { Pagination } from "@/components/ui/Pagination";
import { apiClientFetch } from "@/lib/api/client";
import type { AppNotification } from "@/lib/api/types";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";
import {
  type NotifiableRole,
  notificationQueryKeys,
  notificationsQueryOptions,
} from "@/lib/notifications/queries";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/date";

type NotificationListProps = {
  role: NotifiableRole;
  /** 通知一覧のページ(ページ送りのリンクに使う) */
  basePath: string;
  /** 通知を押したときに開く応募の画面の親のパス(求職者は"/likes"、企業は"/company/likes")。末尾に応募のIDを付ける */
  likesPath: string;
};

/**
 * 通知の一覧(求職者・企業で共通)。未読は目立たせ、押したら既読にして応募の画面へ移る。
 * ページをURLで持つため<Suspense>の中に置く
 */
export function NotificationList({
  role,
  basePath,
  likesPath,
}: NotificationListProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data, isPending, isError } = useQuery(
    notificationsQueryOptions(role, page),
  );

  const markAsRead = useMutation({
    mutationFn: (id: string) =>
      apiClientFetch(`/${role}/notifications/${id}/read`, { method: "POST" }),
    // 一覧と、ヘッダーのベルの未読数を取り直す
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all(role),
      }),
  });

  if (isPending) {
    return (
      <div className="h-64 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  if (isError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  if (data.data.length === 0) {
    return (
      <p className="border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center text-sm text-ink-sub">
        通知はまだありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col border-2 border-primary bg-white shadow-hard">
        {data.data.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            href={`${likesPath}/${notification.like_id}`}
            // 未読なら、移動と同時に既読にする(既読の通知では何もしない)
            onOpen={() =>
              notification.read_at === null &&
              markAsRead.mutate(notification.id)
            }
          />
        ))}
      </ul>
      <Pagination
        currentPage={data.meta.current_page}
        lastPage={data.meta.last_page}
        getHref={(nextPage) =>
          nextPage > 1 ? `${basePath}?page=${nextPage}` : basePath
        }
      />
    </div>
  );
}

type NotificationItemProps = {
  notification: AppNotification;
  href: string;
  onOpen: () => void;
};

function NotificationItem({
  notification,
  href,
  onOpen,
}: NotificationItemProps) {
  const unread = notification.read_at === null;

  return (
    <li className="border-b-2 border-tint last:border-b-0">
      <Link
        href={href}
        onClick={onOpen}
        className={cn(
          "group flex items-start gap-3 px-5 py-4 transition hover:bg-page",
          !unread && "bg-page/50",
        )}
      >
        {/* 未読は赤い印と太字で目立たせる */}
        <span
          aria-hidden
          className={cn(
            "mt-1.5 size-2.5 shrink-0",
            unread ? "bg-accent" : "bg-transparent",
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p
            className={cn(
              "text-sm leading-relaxed group-hover:underline group-hover:underline-offset-4",
              unread ? "font-bold text-ink" : "text-ink-sub",
            )}
          >
            {unread && <span className="sr-only">未読:</span>}
            {notification.message}
          </p>
          <p className="text-xs text-ink-sub">
            {formatDateTime(notification.created_at)}
          </p>
        </div>
      </Link>
    </li>
  );
}
