"use client";

import { useQuery } from "@tanstack/react-query";

import { FormAlert } from "@/components/ui/FormAlert";
import { companyJobPostingQueryOptions } from "@/lib/company/queries";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";

import { JobPostingForm } from "./JobPostingForm";

/**
 * 求人の編集フォーム。保存済みの内容を取得してから、初期値としてフォームに入れる
 */
export function EditJobPostingForm({ id }: { id: number }) {
  const {
    data: jobPosting,
    isPending,
    isError,
  } = useQuery(companyJobPostingQueryOptions(id));

  if (isPending) {
    return (
      <div className="h-96 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  if (isError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  return <JobPostingForm jobPosting={jobPosting} />;
}
