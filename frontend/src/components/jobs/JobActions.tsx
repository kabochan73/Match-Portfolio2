"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { FormSuccess } from "@/components/ui/FormSuccess";
import { ApiError } from "@/lib/api/errors";
import type { JobMyStatus } from "@/lib/api/types";
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
      <div className="h-28 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  // 未ログイン(企業でログイン中を含む)なら、ログインしてからこの求人に戻ってくる
  if (error instanceof ApiError && error.status === 401) {
    return <GuestActions jobPostingId={jobPostingId} isClosed={isClosed} />;
  }

  if (!status) {
    return null;
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <FormSuccess
        message={
          liked
            ? "いいねを送りました。企業からの返事(7日以内)を待ちましょう。"
            : undefined
        }
      />
      <LikeStatusPanel
        status={status}
        isClosed={isClosed}
        onOpenForm={() => setFormOpen(true)}
      />
      <BookmarkButton
        jobPostingId={jobPostingId}
        bookmarked={status.bookmarked}
      />

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
    </Card>
  );
}

type LikeStatusPanelProps = {
  status: JobMyStatus;
  isClosed: boolean;
  onOpenForm: () => void;
};

/** いいねのボタン、または応募済みの状況 */
function LikeStatusPanel({
  status,
  isClosed,
  onOpenForm,
}: LikeStatusPanelProps) {
  const like = status.like;

  // 期限切れのあとは、もう一度いいねできる
  if (like && like.status.value !== "expired") {
    const messages: Record<string, string> = {
      applied: "いいね済みです。企業からの返事を待っています。",
      matched: "マッチしました。企業から登録メールアドレスに連絡が届きます。",
      declined: "今回は見送りとなりました。",
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-2 border-2 p-4 text-sm",
          like.status.value === "matched"
            ? "border-primary bg-tint text-primary"
            : "border-line-soft bg-page text-ink-body",
        )}
      >
        <p className="flex items-center gap-2 font-bold">
          <Heart className="size-4 fill-current text-accent" aria-hidden />
          {like.status.label}
        </p>
        <p>{messages[like.status.value]}</p>
        <Link
          href={`/likes/${like.id}`}
          className="self-start font-bold text-primary underline underline-offset-4"
        >
          応募の詳細を見る
        </Link>
      </div>
    );
  }

  if (isClosed) {
    return (
      <p className="border-2 border-line-soft bg-page p-4 text-sm text-ink-body">
        この求人は募集を終了しているため、いいねできません。
      </p>
    );
  }

  return (
    <>
      {like?.status.value === "expired" && (
        <p className="text-xs text-ink-sub">
          前回のいいねは、企業から返事がなく期限切れになりました。もう一度いいねできます。
        </p>
      )}
      <Button
        size="lg"
        variant="accent"
        withShadow
        onClick={onOpenForm}
        className="w-full"
      >
        <Heart className="size-5" aria-hidden />
        いいねして応募する
      </Button>
    </>
  );
}

/** 未ログインのとき。押すとログイン画面へ移り、ログイン後にこの求人へ戻る */
function GuestActions({ jobPostingId, isClosed }: JobActionsProps) {
  const loginHref = `/login?redirect=${encodeURIComponent(`/jobs/${jobPostingId}`)}`;

  return (
    <Card className="flex flex-col gap-3 p-5">
      {!isClosed && (
        <Link
          href={loginHref}
          className={cn(
            buttonClass({ variant: "accent", size: "lg", withShadow: true }),
            "w-full",
          )}
        >
          <Heart className="size-5" aria-hidden />
          いいねして応募する
        </Link>
      )}
      <Link
        href={loginHref}
        className={cn(buttonClass({ variant: "secondary" }), "w-full")}
      >
        <Bookmark className="size-4" aria-hidden />
        ブックマーク
      </Link>
      <p className="text-xs text-ink-sub">
        いいね・ブックマークには
        <Link href={loginHref} className="font-bold text-primary underline">
          ログイン
        </Link>
        が必要です。
      </p>
    </Card>
  );
}
