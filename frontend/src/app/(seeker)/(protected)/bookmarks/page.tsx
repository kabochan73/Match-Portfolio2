import type { Metadata } from "next";
import { Suspense } from "react";

import { BookmarkList } from "@/components/seeker/BookmarkList";

export const metadata: Metadata = {
  title: "ブックマーク | Tech Match",
};

/**
 * ブックマーク一覧。ページはURLで持つため、URLを読む部分を<Suspense>で囲む
 */
export default function BookmarksPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black text-primary">ブックマーク</h1>
      <Suspense
        fallback={
          <div className="h-64 animate-pulse border-2 border-primary/30 bg-white" />
        }
      >
        <BookmarkList />
      </Suspense>
    </div>
  );
}
