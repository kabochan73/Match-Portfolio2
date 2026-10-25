"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { JobCard } from "@/components/jobs/JobCard";
import { buttonClass } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { TabLinks } from "@/components/ui/TabLinks";
import type { CompanyJobPosting } from "@/lib/api/types";
import { companyJobPostingsQueryOptions } from "@/lib/company/queries";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";

type JobPostingTab = "published" | "draft" | "closed";

const TABS: { value: JobPostingTab; label: string; empty: string }[] = [
  {
    value: "published",
    label: "公開中",
    empty:
      "公開中の求人はありません。下書きの求人を公開すると、ここに表示されます。",
  },
  { value: "draft", label: "下書き", empty: "下書きの求人はありません。" },
  {
    value: "closed",
    label: "募集終了",
    empty: "募集を終了した求人はありません。",
  },
];

/** 求人管理のURL(タブをクエリに持たせる。公開中は省略) */
function jobPostingsHref(tab: JobPostingTab): string {
  return tab === "published"
    ? "/company/job-postings"
    : `/company/job-postings?status=${tab}`;
}

/**
 * 求人管理の一覧(求職者側と同じ求人カード。PCは2列)。公開中の件数と上限を上に出し、
 * 状態(公開中・下書き・募集終了)をタブで切り替える。カードの上には、反応待ちの応募の件数を赤で出す。
 * 一覧は全件を受け取っているため、タブごとの絞り込みはブラウザで行う。タブはURLで持つため<Suspense>の中に置く
 */
export function JobPostingTable() {
  const searchParams = useSearchParams();
  const tab =
    TABS.find(({ value }) => value === searchParams.get("status")) ?? TABS[0];
  const { data, isPending, isError } = useQuery(
    companyJobPostingsQueryOptions(),
  );

  if (isPending) {
    return null;
  }

  if (isError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  const { data: jobPostings, meta } = data;

  // 求人が1件もなければ、タブを出さずに作成を案内する
  if (jobPostings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center">
        <p className="text-sm text-ink-body">
          まだ求人がありません。最初の求人を作成しましょう。
        </p>
        <Link
          href="/company/job-postings/new"
          className={buttonClass({ withShadow: true })}
        >
          求人を作成
        </Link>
      </div>
    );
  }

  const tabJobPostings = jobPostings.filter(
    (jobPosting) => jobPosting.status.value === tab.value,
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-body">
        公開中
        <span className="mx-1 font-display text-xl font-bold text-primary">
          {meta.published_count}
        </span>
        / {meta.max_published}件
      </p>

      <TabLinks
        label="求人の状態"
        tabs={TABS.map(({ value, label }) => ({
          href: jobPostingsHref(value),
          label,
          count: jobPostings.filter(
            (jobPosting) => jobPosting.status.value === value,
          ).length,
          isCurrent: value === tab.value,
        }))}
      />

      {tabJobPostings.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2">
          {tabJobPostings.map((jobPosting) => (
            <li key={jobPosting.id} className="flex flex-col gap-2">
              <JobPostingBadges jobPosting={jobPosting} />
              <JobCard
                job={{
                  ...jobPosting,
                  cover_image_url: jobPosting.cover_image_url ?? null,
                }}
                href={`/company/job-postings/${jobPosting.id}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center text-sm text-ink-body">
          {tab.empty}
        </p>
      )}
    </div>
  );
}

/** カードの上に出す、反応待ちの件数(なければ、カードの高さをそろえるため空ける) */
function JobPostingBadges({ jobPosting }: { jobPosting: CompanyJobPosting }) {
  return (
    <div className="flex min-h-6 flex-wrap items-center gap-3">
      {/* 返事を忘れて期限切れにしないよう、反応待ちがある求人は赤で目立たせる */}
      {jobPosting.pending_likes_count > 0 && (
        <span className="flex items-center gap-1 text-sm font-bold text-accent">
          <CircleAlert className="size-4" aria-hidden />
          反応待ち
          <span className="font-display">{jobPosting.pending_likes_count}</span>
          件
        </span>
      )}
    </div>
  );
}
