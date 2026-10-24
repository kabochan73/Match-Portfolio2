import { Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import {
  HeaderAccountMenu,
  HeaderAccountMenuSkeleton,
} from "./HeaderAccountMenu";
import { Logo } from "./Logo";

/**
 * 求職者向けのヘッダー。ロゴと「求人を探す」は静的な骨組みとして配信し、
 * ログイン状態で変わる右側だけを<Suspense>の中でリクエストごとに描画する
 */
export function PublicHeader() {
  return (
    <header className="border-b-2 border-primary bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <Logo />
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 py-2 font-bold text-primary"
          >
            <Search className="size-4" aria-hidden />
            求人を探す
          </Link>
        </div>
        <Suspense fallback={<HeaderAccountMenuSkeleton />}>
          <HeaderAccountMenu />
        </Suspense>
      </div>
    </header>
  );
}
