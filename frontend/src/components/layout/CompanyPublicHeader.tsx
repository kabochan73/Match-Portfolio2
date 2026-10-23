import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

import { Logo } from "./Logo";

/**
 * 企業向けページのヘッダー。求職者向けのボタン(会員登録など)は出さず、企業のログイン・登録だけを置く
 */
export function CompanyPublicHeader() {
  return (
    <header className="border-b-2 border-primary bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo linked={false} />
          <span className="border-2 border-primary px-2 font-display text-[11px] font-bold tracking-wider text-primary">
            for Companies
          </span>
        </div>
        {/* スマホでは2つのボタンを横幅いっぱいに並べる。「求職者の方はこちら」はフッターにもあるため隠す */}
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link
            href="/"
            className="hidden px-1 py-3 text-sm font-bold text-ink-sub underline-offset-4 hover:underline sm:block"
          >
            求職者の方はこちら
          </Link>
          <Link
            href="/company/login"
            className={cn(
              buttonClass({ variant: "secondary" }),
              "flex-1 sm:flex-none",
            )}
          >
            企業ログイン
          </Link>
          <Link
            href="/company/register"
            className={cn(
              buttonClass({ variant: "accent" }),
              "flex-1 sm:flex-none",
            )}
          >
            無料で掲載をはじめる
          </Link>
        </div>
      </div>
    </header>
  );
}
