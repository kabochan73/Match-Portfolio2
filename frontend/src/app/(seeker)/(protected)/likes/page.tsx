import type { Metadata } from "next";
import { Suspense } from "react";

import { SeekerLikesBoard } from "@/components/seeker/SeekerLikesBoard";

export const metadata: Metadata = {
  title: "応募状況 | Tech Match",
};

/**
 * 応募状況。タブ・ページはURLで持つため、URLを読む部分を<Suspense>で囲む
 */
export default function LikesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-primary">応募状況</h1>
        <p className="mt-1 text-sm text-ink-body">
          企業は7日以内に「気になる」か「見送り」を返します。マッチしたら、企業から登録メールアドレスに連絡が届きます。
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-64 animate-pulse border-2 border-primary/30 bg-white" />
        }
      >
        <SeekerLikesBoard />
      </Suspense>
    </div>
  );
}
