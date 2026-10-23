import type { Metadata } from "next";
import { Suspense } from "react";

import { NotificationList } from "@/components/notifications/NotificationList";

export const metadata: Metadata = {
  title: "通知 | Tech Match",
};

/**
 * 求職者の通知一覧。押すと既読にして、その応募の詳細へ移る。ページをURLで持つため<Suspense>で囲む
 */
export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black text-primary">通知</h1>
      <Suspense
        fallback={
          <div className="h-64 animate-pulse border-2 border-primary/30 bg-white" />
        }
      >
        <NotificationList
          role="seeker"
          basePath="/notifications"
          likesPath="/likes"
        />
      </Suspense>
    </div>
  );
}
