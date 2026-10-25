"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert, Heart } from "lucide-react";
import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import type { CompanyJobPosting } from "@/lib/api/types";
import { companyJobPostingsQueryOptions } from "@/lib/company/queries";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";

import { JobPostingStatusBadge } from "./JobPostingStatusBadge";

/**
 * 求人管理の一覧(1行に1求人)。公開中の件数と上限を上に出し、反応待ちの応募がある求人は赤で知らせる
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
        <ul className="flex flex-col border-2 border-primary bg-white shadow-hard">
          {jobPostings.map((jobPosting) => (
            <JobPostingRow key={jobPosting.id} jobPosting={jobPosting} />
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

function JobPostingRow({ jobPosting }: { jobPosting: CompanyJobPosting }) {
  return (
    <li className="border-b-2 border-primary last:border-b-0">
      <Link
        href={`/company/job-postings/${jobPosting.id}`}
        className="group grid gap-3 px-5 py-4 transition hover:bg-page md:grid-cols-[1fr_7rem_10rem] md:items-center"
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="truncate font-bold text-ink group-hover:underline group-hover:underline-offset-4">
            {jobPosting.title}
          </p>
          <p className="truncate text-xs text-ink-sub">
            {jobPosting.job_categories.map(({ name }) => name).join(" / ")}
          </p>
        </div>

        <div>
          <JobPostingStatusBadge status={jobPosting.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1 text-ink-body">
            <Heart className="size-4 text-accent" aria-hidden />
            応募
            <span className="font-display font-bold">
              {jobPosting.likes_count}
            </span>
            件
          </span>
          {/* 返事を忘れて期限切れにしないよう、反応待ちがある求人は赤で目立たせる */}
          {jobPosting.pending_likes_count > 0 && (
            <span className="flex items-center gap-1 font-bold text-accent">
              <CircleAlert className="size-4" aria-hidden />
              反応待ち
              <span className="font-display">
                {jobPosting.pending_likes_count}
              </span>
              件
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

function JobPostingTableSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="h-7 w-32 bg-tint" />
      <div className="h-64 border-2 border-primary/30 bg-white" />
    </div>
  );
}
