import { Suspense } from "react";

import { RequireSignedIn } from "@/components/auth/RequireSignedIn";
import { CompanyAdminHeader } from "@/components/layout/CompanyAdminHeader";
import { Footer } from "@/components/layout/Footer";

/**
 * 企業の管理画面の枠。ヘッダーは静的な骨組みとして先に出し、
 * ログインしているかを確かめてから中身を描画する(未ログインなら企業ログインへ)
 */
export default function CompanyProtectedLayout({
  children,
}: LayoutProps<"/company">) {
  return (
    <>
      <CompanyAdminHeader />
      {/* 公開ページと同じ並びにする求人の詳細では、WideMainがdata-layout="wide"を付け、公開ページと同じ幅に広げる */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 data-[layout=wide]:max-w-7xl sm:px-6 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse bg-tint" />}>
          <RequireSignedIn as="company">{children}</RequireSignedIn>
        </Suspense>
      </main>
      {/* ログイン中なので、企業ログイン・企業登録などのリンクは出さない */}
      <Footer links={[]} />
    </>
  );
}
