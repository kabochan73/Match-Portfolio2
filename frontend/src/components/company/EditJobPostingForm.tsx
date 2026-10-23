"use client";

import { useQuery } from "@tanstack/react-query";

import { QueryErrorNotice } from "@/components/ui/QueryErrorNotice";
import { companyJobPostingQueryOptions } from "@/lib/company/queries";

import { JobPostingForm } from "./JobPostingForm";

/**
 * 求人の編集フォーム。保存済みの内容を取得してから、初期値としてフォームに入れる
 */
export function EditJobPostingForm({ id }: { id: number }) {
  const {
    data: jobPosting,
    isPending,
    isError,
    error,
  } = useQuery(companyJobPostingQueryOptions(id));

  if (isPending) {
    return (
      <div className="h-96 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  if (isError) {
    return (
      <QueryErrorNotice
        error={error}
        notFoundMessage="この求人は見つかりませんでした。削除されたか、URLが間違っている可能性があります。"
        backHref="/company/job-postings"
        backLabel="求人管理へ戻る"
      />
    );
  }

  return <JobPostingForm jobPosting={jobPosting} />;
}
