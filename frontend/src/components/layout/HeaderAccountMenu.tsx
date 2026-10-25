import { Bookmark, Heart, UserRound } from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { buttonClass } from "@/components/ui/Button";
import { IconLink } from "@/components/ui/IconLink";
import { getCurrentSeeker } from "@/lib/seeker/api";
import { cn } from "@/lib/utils/cn";

// スマホでは2つのボタンを横幅いっぱいに並べる
const menuClass = "flex w-full items-center gap-3 sm:w-auto";
const buttonWidthClass = "flex-1 sm:flex-none";

/**
 * ヘッダーの右側(ログイン状態で出し分ける)。Cookieを読むため、<Suspense>の中に置く
 */
export async function HeaderAccountMenu() {
  const seeker = await getCurrentSeeker();

  if (!seeker) {
    return <GuestMenu />;
  }

  return (
    <div className="flex items-center gap-3">
      <IconLink href="/likes" label="応募状況">
        <Heart className="size-5" aria-hidden />
      </IconLink>
      <IconLink href="/bookmarks" label="ブックマーク">
        <Bookmark className="size-5" aria-hidden />
      </IconLink>
      <NotificationBell role="seeker" href="/notifications" />
      <IconLink href="/mypage" label="マイページ">
        <UserRound className="size-5" aria-hidden />
      </IconLink>
      <LogoutButton endpoint="/seeker/logout" redirectTo="/" iconOnly />
    </div>
  );
}

function GuestMenu() {
  return (
    <div className={menuClass}>
      {/* 「企業の方はこちら」はフッターにもあるため、スマホでは隠す */}
      <Link
        href="/for-companies"
        className="hidden px-1 py-3 text-sm font-bold text-ink-sub underline-offset-4 hover:underline sm:block"
      >
        企業の方はこちら
      </Link>
      <Link
        href="/login"
        className={cn(buttonClass({ variant: "secondary" }), buttonWidthClass)}
      >
        ログイン
      </Link>
      <Link href="/register" className={cn(buttonClass(), buttonWidthClass)}>
        無料で会員登録
      </Link>
    </div>
  );
}

/**
 * ログイン状態を確かめる間に出す、ボタンと同じ大きさの空の枠。
 * 「ログイン」が一瞬見えてから「マイページ」に変わる、というちらつきを避けるため、どちらの表示も先に出さない
 */
export function HeaderAccountMenuSkeleton() {
  return (
    <div className={menuClass} aria-hidden>
      <div className="h-11 flex-1 sm:w-28 sm:flex-none" />
      <div className="h-11 flex-1 sm:w-36 sm:flex-none" />
    </div>
  );
}
