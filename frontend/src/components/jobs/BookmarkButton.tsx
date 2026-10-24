"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { apiClientFetch } from "@/lib/api/client";
import type { JobMyStatus } from "@/lib/api/types";
import { seekerQueryKeys } from "@/lib/seeker/queries";
import { cn } from "@/lib/utils/cn";

type BookmarkButtonProps = {
  jobPostingId: number;
  bookmarked: boolean;
};

/**
 * ブックマークのボタン。ほぼ失敗せず何度も押す操作のため、押した瞬間に切り替え(楽観的UI)、失敗したら元に戻す
 */
export function BookmarkButton({
  jobPostingId,
  bookmarked,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();
  const queryKey = seekerQueryKeys.myStatus(jobPostingId);

  const toggle = useMutation({
    mutationFn: (next: boolean) =>
      apiClientFetch(`/seeker/job-postings/${jobPostingId}/bookmark`, {
        method: next ? "PUT" : "DELETE",
      }),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<JobMyStatus>(queryKey);
      queryClient.setQueryData<JobMyStatus>(
        queryKey,
        (status) => status && { ...status, bookmarked: next },
      );

      return { previous };
    },
    onError: (_error, _next, context) =>
      queryClient.setQueryData(queryKey, context?.previous),
    // ブックマーク一覧にも反映する
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: seekerQueryKeys.all }),
  });

  return (
    <Button
      variant="secondary"
      size="lg"
      aria-pressed={bookmarked}
      onClick={() => toggle.mutate(!bookmarked)}
    >
      <Bookmark
        className={cn("size-4", bookmarked && "fill-current")}
        aria-hidden
      />
      {bookmarked ? "ブックマーク済み" : "ブックマーク"}
    </Button>
  );
}
