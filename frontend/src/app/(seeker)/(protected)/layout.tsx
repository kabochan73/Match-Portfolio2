import { Suspense } from "react";

import { RequireSignedIn } from "@/components/auth/RequireSignedIn";
import { Footer } from "@/components/layout/Footer";
import { PublicHeader } from "@/components/layout/PublicHeader";

/**
 * 求職者のログイン後のページ(マイページ・応募状況・ブックマーク・通知)の枠。
 * ヘッダー・フッターは公開ページと同じものを使い、ログインしているかを確かめてから中身を描画する(未ログインならログインへ)
 */
export default function SeekerProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse bg-tint" />}>
          <RequireSignedIn as="seeker">{children}</RequireSignedIn>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
