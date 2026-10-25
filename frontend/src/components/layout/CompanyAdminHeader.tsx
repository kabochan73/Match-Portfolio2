import { Building2 } from "lucide-react";
import { Suspense } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { IconLink } from "@/components/ui/IconLink";

import { AdminNavLink, StaticAdminNavLink } from "./AdminNavLink";
import { Logo } from "./Logo";

// 管理画面のナビ。追加・並べ替えはこの配列だけで行う
const navLinks = [
  { href: "/company/job-postings", label: "求人管理" },
  { href: "/company/likes", label: "応募者" },
] as const;

/**
 * 企業の管理画面のヘッダー。ロゴ以外(ナビ・通知のベル・企業ページ・ログアウト)は右に寄せる
 */
export function CompanyAdminHeader() {
  return (
    <header className="border-b-2 border-primary bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo linked={false} />
          <span className="border-2 border-primary px-2 font-display text-[11px] font-bold tracking-wider text-primary">
            for Companies
          </span>
        </div>
        {/* ナビとアイコンをまとめて右に寄せる(スマホではまとめて2行目に回る) */}
        <div className="ml-auto flex items-center gap-6">
          <nav aria-label="管理画面" className="flex gap-6">
            {/* 今いるページの下線はURLを読んで決めるため、読むまでは下線なしのリンクを出す */}
            <Suspense
              fallback={navLinks.map((link) => (
                <StaticAdminNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                />
              ))}
            >
              {navLinks.map((link) => (
                <AdminNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                />
              ))}
            </Suspense>
          </nav>
          <div className="flex items-center gap-3">
            <NotificationBell role="company" href="/company/notifications" />
            <IconLink href="/company/profile" label="企業ページ">
              <Building2 className="size-5" aria-hidden />
            </IconLink>
            <LogoutButton
              endpoint="/company/logout"
              redirectTo="/for-companies"
              iconOnly
            />
          </div>
        </div>
      </div>
    </header>
  );
}
