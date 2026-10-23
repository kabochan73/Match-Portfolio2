"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

import {
  type NotifiableRole,
  unreadCountQueryOptions,
} from "@/lib/notifications/queries";

type NotificationBellProps = {
  role: NotifiableRole;
  /** 通知一覧のページ */
  href: string;
};

/**
 * ヘッダーのベル。未読があれば赤いバッジで数を出す(10件以上は「9+」)
 */
export function NotificationBell({ role, href }: NotificationBellProps) {
  const { data: unreadCount = 0 } = useQuery(unreadCountQueryOptions(role));

  return (
    <Link
      href={href}
      aria-label={unreadCount > 0 ? `通知(未読${unreadCount}件)` : "通知"}
      className="relative flex size-11 items-center justify-center border-2 border-primary bg-white text-primary transition hover:bg-tint"
    >
      <Bell className="size-5" aria-hidden />
      {unreadCount > 0 && (
        <span
          aria-hidden
          className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center bg-accent px-1 font-display text-[11px] font-bold text-white"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
