"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import Link from "next/link";

import { JobCard } from "@/components/jobs/JobCard";
import { buttonClass } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import type { CompanyJobPosting } from "@/lib/api/types";
import { companyJobPostingsQueryOptions } from "@/lib/company/queries";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";

import { JobPostingStatusBadge } from "./JobPostingStatusBadge";

/**
 * 求人管理の一覧(求職者側と同じ求人カード。PCは2列)。公開中の件数と上限を上に出し、
 * カードの上に状態と、反応待ちの応募がある場合はその件数を赤で出す
 */
export function JobPostingTable() {
  const { data, isPending, isError } = useQuery(
    companyJobPostingsQueryOptions(),
  );

  if (isPending) {
    return <JobPostingTableSkeleton />;
  }

  if (isError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  const { data: jobPostings, meta } = data;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-body">
        公開中
        <span className="mx-1 font-display text-xl font-bold text-primary">
          {meta.published_count}
        </span>
        / {meta.max_published}件
      </p>

      {jobPostings.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2">
          {jobPostings.map((jobPosting) => (
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
      )}
    </div>
  );
}

/** カードの上に出す、求人の状態と反応待ちの件数 */
function JobPostingBadges({ jobPosting }: { jobPosting: CompanyJobPosting }) {
  return (
    <div className="flex min-h-6 flex-wrap items-center gap-3">
      <JobPostingStatusBadge status={jobPosting.status} />
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

function JobPostingTableSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="h-7 w-32 bg-tint" />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-80 border-2 border-primary/30 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
