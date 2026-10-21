import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

import { Logo } from "./Logo";

/**
 * ログインしていない人向けのヘッダー。
 * ログイン中の表示(❤️・🔖・通知・マイページ)は、ログイン機能を作るときに<Suspense>の中で出し分ける
 */
export function PublicHeader() {
  return (
    <header className="border-b-2 border-primary bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <Logo />
          <Link href="/jobs" className="py-2 font-bold text-primary">
            求人を探す
          </Link>
        </div>
        {/* スマホでは2つのボタンを横幅いっぱいに並べる。「企業の方はこちら」はフッターにもあるため隠す */}
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link
            href="/for-companies"
            className="hidden px-1 py-3 text-sm font-bold text-ink-sub underline-offset-4 hover:underline sm:block"
          >
            企業の方はこちら
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonClass({ variant: "secondary" }),
              "flex-1 sm:flex-none",
            )}
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className={cn(buttonClass(), "flex-1 sm:flex-none")}
          >
            無料で会員登録
          </Link>
        </div>
      </div>
    </header>
  );
}
