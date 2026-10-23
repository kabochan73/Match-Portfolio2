import { Suspense } from "react";

import { CompanyHeaderAccountMenu } from "./CompanyHeaderAccountMenu";
import { HeaderAccountMenuSkeleton } from "./HeaderAccountMenu";
import { Logo } from "./Logo";

/**
 * 企業向けページのヘッダー。求職者向けのボタン(会員登録など)は出さず、企業のログイン・登録だけを置く。
 * ログイン状態で変わる右側だけを<Suspense>の中でリクエストごとに描画する
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
        <Suspense fallback={<HeaderAccountMenuSkeleton />}>
          <CompanyHeaderAccountMenu />
        </Suspense>
      </div>
    </header>
  );
}
