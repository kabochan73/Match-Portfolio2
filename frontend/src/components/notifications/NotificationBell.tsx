"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

import { IconLink } from "@/components/ui/IconLink";
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
 * ヘッダーのベル。未読があれば赤いバッジで数を出す
 */
export function NotificationBell({ role, href }: NotificationBellProps) {
  const { data: unreadCount = 0 } = useQuery(unreadCountQueryOptions(role));

  return (
    <IconLink
      href={href}
      label={unreadCount > 0 ? `通知(未読${unreadCount}件)` : "通知"}
      badge={unreadCount}
    >
      <Bell className="size-5" aria-hidden />
    </IconLink>
  );
}
