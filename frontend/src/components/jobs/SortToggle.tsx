import Link from "next/link";

import type { JobSearchParams } from "@/lib/jobs/api";
import { jobsHref } from "@/lib/jobs/searchParams";
import { cn } from "@/lib/utils/cn";

const SORT_OPTIONS = [
  { value: "new", label: "新着順" },
  { value: "popular", label: "人気順" },
] as const;

type SortToggleProps = {
  params: JobSearchParams;
};

/**
 * 求人一覧の並び替え(新着順・人気順)。検索条件はそのままに、並び順だけを変えたURLへのリンクにする
 */
export function SortToggle({ params }: SortToggleProps) {
  const current = params.sort ?? "new";

  return (
    <nav
      aria-label="並び替え"
      className="flex border-2 border-primary bg-white"
    >
      {SORT_OPTIONS.map((option) => {
        const isCurrent = option.value === current;

        return (
          <Link
            key={option.value}
            // 並び順が変わると何ページ目かの意味も変わるため、1ページ目に戻す
            href={jobsHref({ ...params, sort: option.value, page: 1 })}
            aria-current={isCurrent ? "page" : undefined}
            // 並び替えてもスクロール位置は保つ
            scroll={false}
            className={cn(
              "px-4 py-2 text-xs font-bold transition",
              isCurrent
                ? "bg-primary text-white"
                : "text-primary hover:bg-tint",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
