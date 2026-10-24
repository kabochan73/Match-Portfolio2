import Link from "next/link";
import type { ReactNode } from "react";

type IconLinkProps = {
  href: string;
  /** 読み上げ用の名前(アイコンだけで文字がないため) */
  label: string;
  children: ReactNode;
  /** 右上に重ねて出す数(未読の数など)。0以下なら出さない(10以上は「9+」) */
  badge?: number;
};

/**
 * ヘッダーに並べるアイコンのリンク(応募状況・ブックマーク・通知)
 */
export function IconLink({ href, label, children, badge = 0 }: IconLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex size-11 shrink-0 items-center justify-center text-primary transition hover:bg-tint"
    >
      {children}
      {badge > 0 && (
        <span
          aria-hidden
          className="absolute top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center bg-accent px-1 font-display text-[11px] font-bold text-white"
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
