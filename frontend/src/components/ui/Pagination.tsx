import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** 省略せずにすべての番号を並べるページ数の上限。超えたら「…」で間を省く */
const MAX_PAGE_ITEMS = 7;

type PaginationProps = {
  currentPage: number;
  lastPage: number;
  /** ページ番号からリンク先のURLを作る(検索条件などは呼び出し側で引き継ぐ) */
  getHref: (page: number) => string;
};

/**
 * ページ送り(前へ・番号・次へ)。1ページしかないときは何も表示しない
 *
 * @example <Pagination currentPage={3} lastPage={12} getHref={(page) => `/jobs?page=${page}`} />
 */
export function Pagination({
  currentPage,
  lastPage,
  getHref,
}: PaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  return (
    <nav aria-label="ページ送り" className="flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          <PageLink
            href={currentPage > 1 ? getHref(currentPage - 1) : undefined}
            label="前のページ"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </PageLink>
        </li>

        {pageItems(currentPage, lastPage).map((item, index) =>
          item === "ellipsis" ? (
            <li
              // 「…」は最大2つで、位置で区別できる
              key={`ellipsis-${index}`}
              aria-hidden
              className="w-6 text-center font-display text-sm text-ink-sub"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <PageLink
                href={getHref(item)}
                label={`${item}ページ目`}
                isCurrent={item === currentPage}
              >
                {item}
              </PageLink>
            </li>
          ),
        )}

        <li>
          <PageLink
            href={currentPage < lastPage ? getHref(currentPage + 1) : undefined}
            label="次のページ"
          >
            <ChevronRight className="size-4" aria-hidden />
          </PageLink>
        </li>
      </ul>
    </nav>
  );
}

type PageLinkProps = {
  /** なければ押せない状態(1ページ目の「前へ」など)で表示する */
  href?: string;
  label: string;
  isCurrent?: boolean;
  children: ReactNode;
};

function PageLink({ href, label, isCurrent = false, children }: PageLinkProps) {
  const className = cn(
    "flex size-10 items-center justify-center border-2 border-primary font-display text-sm font-bold transition",
    isCurrent ? "bg-primary text-white" : "bg-white text-primary",
  );

  if (!href) {
    return (
      <span aria-disabled className={cn(className, "opacity-30")}>
        {children}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        className,
        !isCurrent && "hover:bg-tint",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      )}
    >
      {children}
    </Link>
  );
}

/**
 * 並べるページ番号。多いときは最初・最後・今のページの前後だけを残して「…」で省く
 *
 * @example pageItems(6, 12) // [1, "ellipsis", 5, 6, 7, "ellipsis", 12]
 * @example pageItems(2, 12) // [1, 2, 3, 4, 5, "ellipsis", 12]
 */
function pageItems(
  currentPage: number,
  lastPage: number,
): (number | "ellipsis")[] {
  if (lastPage <= MAX_PAGE_ITEMS) {
    return range(1, lastPage);
  }

  // 端に近いときは、端から5つを続けて並べる(「1 … 2」のような無駄な省略を避ける)
  if (currentPage <= 4) {
    return [...range(1, 5), "ellipsis", lastPage];
  }
  if (currentPage >= lastPage - 3) {
    return [1, "ellipsis", ...range(lastPage - 4, lastPage)];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    lastPage,
  ];
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}
