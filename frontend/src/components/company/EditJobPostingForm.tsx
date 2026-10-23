"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { GalleryInput } from "@/components/images/GalleryInput";
import { FormSection } from "@/components/ui/FormSection";
import { QueryErrorNotice } from "@/components/ui/QueryErrorNotice";
import {
  companyJobPostingQueryOptions,
  companyQueryKeys,
} from "@/lib/company/queries";

import { JobPostingForm } from "./JobPostingForm";

/** 求人の写真の上限(Laravelのバリデーションと合わせる) */
const MAX_JOB_POSTING_IMAGES = 5;

/**
 * 求人の編集フォーム。保存済みの内容を取得してから、初期値としてフォームに入れる。
 * 写真はフォームとは別に、選んだ時点で保存する
 */
export function EditJobPostingForm({ id }: { id: number }) {
  const queryClient = useQueryClient();
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

  return (
    <div className="flex flex-col gap-6">
      <FormSection title="写真">
        <GalleryInput
          images={jobPosting.images ?? []}
          max={MAX_JOB_POSTING_IMAGES}
          uploadPath={`/company/job-postings/${id}/images`}
          deletePathPrefix={`/company/job-postings/${id}/images`}
          firstLabel="カバー画像"
          // 写真とカバー画像が変わるため、この求人と一覧を取り直す
          onChanged={() =>
            queryClient.invalidateQueries({
              queryKey: companyQueryKeys.jobPostings,
            })
          }
        />
      </FormSection>
      <JobPostingForm jobPosting={jobPosting} />
    </div>
  );
}
