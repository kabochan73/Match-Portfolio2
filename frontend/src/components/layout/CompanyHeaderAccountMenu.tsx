import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { buttonClass } from "@/components/ui/Button";
import { getCurrentCompany } from "@/lib/company/api";
import { cn } from "@/lib/utils/cn";

// スマホでは2つのボタンを横幅いっぱいに並べる
const menuClass = "flex w-full items-center gap-3 sm:w-auto";
const buttonWidthClass = "flex-1 sm:flex-none";

/**
 * 企業向けヘッダーの右側(企業のログイン状態で出し分ける)。Cookieを読むため、<Suspense>の中に置く。
 * 確かめる間は、求職者向けと同じHeaderAccountMenuSkeletonを出す
 */
export async function CompanyHeaderAccountMenu() {
  const company = await getCurrentCompany();

  if (!company) {
    return <CompanyGuestMenu />;
  }

  return (
    <div className={menuClass}>
      <Link
        href="/company/job-postings"
        className={cn(buttonClass({ variant: "secondary" }), buttonWidthClass)}
      >
        管理画面
      </Link>
      <LogoutButton
        endpoint="/company/logout"
        redirectTo="/for-companies"
        className={buttonWidthClass}
      />
    </div>
  );
}

function CompanyGuestMenu() {
  return (
    <div className={menuClass}>
      {/* 「求職者の方はこちら」はフッターにもあるため、スマホでは隠す */}
      <Link
        href="/"
        className="hidden px-1 py-3 text-sm font-bold text-ink-sub underline-offset-4 hover:underline sm:block"
      >
        求職者の方はこちら
      </Link>
      <Link
        href="/company/login"
        className={cn(buttonClass({ variant: "secondary" }), buttonWidthClass)}
      >
        企業ログイン
      </Link>
      <Link
        href="/company/register"
        className={cn(buttonClass({ variant: "accent" }), buttonWidthClass)}
      >
        無料で掲載をはじめる
      </Link>
    </div>
  );
}
