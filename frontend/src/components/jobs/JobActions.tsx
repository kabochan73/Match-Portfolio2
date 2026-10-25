"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonClass } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormSuccess } from "@/components/ui/FormSuccess";
import { ApiError } from "@/lib/api/errors";
import { myStatusQueryOptions, seekerQueryKeys } from "@/lib/seeker/queries";
import { cn } from "@/lib/utils/cn";

import { BookmarkButton } from "./BookmarkButton";
import { LikeForm } from "./LikeForm";

type JobActionsProps = {
  jobPostingId: number;
  /** 募集終了の求人には、いいねできない */
  isClosed: boolean;
};

/**
 * 求人詳細のいいね(応募)・ブックマークのボタン。
 * 求人詳細は全員で同じキャッシュを使うため、自分の状況(応募済みか・ブックマーク済みか)はブラウザで取って重ねる
 */
export function JobActions({ jobPostingId, isClosed }: JobActionsProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const {
    data: status,
    isPending,
    error,
  } = useQuery(myStatusQueryOptions(jobPostingId));

  if (isPending) {
    return (
      <div className="ml-auto h-14 w-80 max-w-full animate-pulse bg-tint" />
    );
  }

  // 未ログイン(企業でログイン中を含む)なら、ログインしてからこの求人に戻ってくる
  if (error instanceof ApiError && error.status === 401) {
    return <GuestActions jobPostingId={jobPostingId} isClosed={isClosed} />;
  }

  if (!status) {
    return null;
  }

  // 期限切れのあとは、もう一度いいねできる
  const activeLike =
    status.like && status.like.status.value !== "expired" ? status.like : null;

  return (
    <div className="flex flex-col gap-3">
      <FormSuccess
        message={
          liked
            ? "いいねを送りました。企業からの返事(7日以内)を待ちましょう。"
            : undefined
        }
      />
      {!activeLike && isClosed && (
        <p className="border-2 border-line-soft bg-page p-4 text-sm text-ink-body">
          この求人は募集を終了しているため、いいねできません。
        </p>
      )}
      {!activeLike && !isClosed && status.like && (
        <p className="text-xs text-ink-sub">
          前回のいいねは、企業から返事がなく期限切れになりました。もう一度いいねできます。
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <BookmarkButton
          jobPostingId={jobPostingId}
          bookmarked={status.bookmarked}
        />
        {/* 応募の結果は応募状況と通知で見られるため、ここでは押せない表示に変えるだけ */}
        {activeLike && (
          <span
            className={cn(
              buttonClass({ variant: "primary", size: "lg" }),
              // 押せないため、乗せても色を変えない
              "hover:bg-primary",
            )}
          >
            <Heart className="size-5 fill-current text-accent" aria-hidden />
            いいね済み
          </span>
        )}
        {!activeLike && !isClosed && (
          <Button
            size="lg"
            variant="accent"
            withShadow
            onClick={() => setFormOpen(true)}
          >
            <Heart className="size-5" aria-hidden />
            いいねして応募する
          </Button>
        )}
      </div>

      <Dialog
        open={formOpen}
        title="いいねして応募する"
        onClose={() => setFormOpen(false)}
        className="w-[min(36rem,calc(100%-2rem))]"
      >
        {formOpen && (
          <LikeForm
            jobPostingId={jobPostingId}
            onCancel={() => setFormOpen(false)}
            onLiked={async () => {
              setFormOpen(false);
              setLiked(true);
              // 自分の状況・残り回数・応募状況を取り直す
              await queryClient.invalidateQueries({
                queryKey: seekerQueryKeys.all,
              });
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

/** 未ログインのとき。押すとログイン画面へ移り、ログイン後にこの求人へ戻る */
function GuestActions({ jobPostingId, isClosed }: JobActionsProps) {
  const loginHref = `/login?redirect=${encodeURIComponent(`/jobs/${jobPostingId}`)}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href={loginHref}
          className={buttonClass({ variant: "secondary", size: "lg" })}
        >
          <Bookmark className="size-4" aria-hidden />
          ブックマーク
        </Link>
        {!isClosed && (
          <Link
            href={loginHref}
            className={buttonClass({
              variant: "accent",
              size: "lg",
              withShadow: true,
            })}
          >
            <Heart className="size-5" aria-hidden />
            いいねして応募する
          </Link>
        )}
      </div>
      <p className="text-right text-xs text-ink-sub">
        いいね・ブックマークには
        <Link href={loginHref} className="font-bold text-primary underline">
          ログイン
        </Link>
        が必要です。
      </p>
    </div>
  );
}
