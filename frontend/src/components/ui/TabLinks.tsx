import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type TabLink = {
  href: string;
  label: string;
  /** タブの横に出す件数 */
  count?: number;
  isCurrent: boolean;
};

type TabLinksProps = {
  tabs: TabLink[];
  /** 読み上げ用のタブ全体の名前 */
  label: string;
};

/**
 * リンクで切り替えるタブ(切り替えるとURLが変わるため、戻る・共有で同じタブが開く)。今のタブは紺の塗り
 */
export function TabLinks({ tabs, label }: TabLinksProps) {
  return (
    <nav
      aria-label={label}
      className="flex overflow-x-auto border-b-2 border-primary"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.isCurrent ? "page" : undefined}
          // タブを切り替えても、スクロール位置は保つ
          scroll={false}
          className={cn(
            "-mb-0.5 flex items-center gap-2 border-2 border-b-0 px-4 py-2.5 text-sm font-bold whitespace-nowrap transition",
            tab.isCurrent
              ? "border-primary bg-primary text-white"
              : "border-transparent text-ink-sub hover:text-primary",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "px-1.5 font-display text-xs",
                tab.isCurrent
                  ? "bg-white text-primary"
                  : "bg-tint text-primary",
              )}
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
