import type { Metadata } from "next";
import { Suspense } from "react";

import { ReceivedLikesBoard } from "@/components/company/ReceivedLikesBoard";

export const metadata: Metadata = {
  title: "応募者 | Tech Match",
};

/**
 * 応募者一覧。タブ・求人の絞り込み・ページはURLで持つため、URLを読む部分を<Suspense>で囲む
 */
export default function CompanyLikesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-primary">応募者</h1>
        <p className="mt-1 text-sm text-ink-body">
          応募には、7日以内に「気になる」か「見送り」を返してください。期限を過ぎると自動で不成立になります。
        </p>
      </div>
      <Suspense>
        <ReceivedLikesBoard />
      </Suspense>
    </div>
  );
}
