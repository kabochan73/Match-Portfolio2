"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type AdminNavLinkProps = {
  href: string;
  label: string;
};

/**
 * 管理画面のナビのリンク。今いるページ(配下のページを含む)は下に赤い線を引く
 */
export function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

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
