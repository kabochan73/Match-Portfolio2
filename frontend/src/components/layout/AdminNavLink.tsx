"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type AdminNavLinkProps = {
  href: string;
  label: string;
};

/**
 * 管理画面のナビのリンク。今いるページ(配下のページを含む)は下に赤い線を引く。
 * URLを読むため、ナビ全体を<Suspense>で囲み、読むまではStaticAdminNavLinkを出す
 */
export function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

  return <StaticAdminNavLink href={href} label={label} isCurrent={isCurrent} />;
}

type StaticAdminNavLinkProps = AdminNavLinkProps & {
  isCurrent?: boolean;
};

/**
 * 管理画面のナビのリンクの見た目(URLを読まない。<Suspense>の読み込み中にも使う)
 */
export function StaticAdminNavLink({
  href,
  label,
  isCurrent = false,
}: StaticAdminNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "border-b-[3px] py-2 text-sm font-bold whitespace-nowrap transition",
        isCurrent
          ? "border-accent text-primary"
          : "border-transparent text-ink-sub hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}
