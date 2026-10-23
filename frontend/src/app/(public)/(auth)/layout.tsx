import { Suspense } from "react";

import { RedirectIfSignedIn } from "@/components/auth/RedirectIfSignedIn";

/**
 * 求職者のログイン・会員登録などの画面の枠。ヘッダー・フッターは(public)のものを使い、フォームを中央に置く。
 * フォームは静的な骨組みとして先に出し、ログイン中なら求人一覧へ移動させる
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      {children}
    </div>
  );
}
