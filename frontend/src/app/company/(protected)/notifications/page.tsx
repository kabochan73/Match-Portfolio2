import type { Metadata } from "next";
import { Suspense } from "react";

import { NotificationList } from "@/components/notifications/NotificationList";

export const metadata: Metadata = {
  title: "通知 | Tech Match",
};

/**
 * 企業の通知一覧。押すと既読にして、その応募者の詳細へ移る。ページをURLで持つため<Suspense>で囲む
 */
export default function CompanyNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black text-primary">通知</h1>
      <Suspense>
        <NotificationList
          role="company"
          basePath="/company/notifications"
          likesPath="/company/likes"
        />
      </Suspense>
    </div>
  );
}
