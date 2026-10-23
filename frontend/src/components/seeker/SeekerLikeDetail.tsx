"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";

import { JobCard } from "@/components/jobs/JobCard";
import { LikeStatusLabel } from "@/components/likes/LikeStatusLabel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MultilineText, PageSection } from "@/components/ui/PageSection";
import { QueryErrorNotice } from "@/components/ui/QueryErrorNotice";
import type { SeekerLike } from "@/lib/api/types";
import { seekerLikeQueryOptions } from "@/lib/seeker/queries";
import { daysUntil, formatDateTime, formatMonthDay } from "@/lib/utils/date";

/**
 * 応募の詳細。今の状況と、送った志望動機・応募先の求人を見せる
 */
export function SeekerLikeDetail({ id }: { id: number }) {
  const {
    data: like,
    isPending,
    isError,
    error,
  } = useQuery(seekerLikeQueryOptions(id));

  if (isPending) {
    return (
      <div className="h-96 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  if (isError) {
    return (
      <QueryErrorNotice
        error={error}
        notFoundMessage="この応募は見つかりませんでした。URLが間違っている可能性があります。"
        backHref="/likes"
        backLabel="応募状況へ戻る"
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {like.like_type.value === "super" && (
            <Badge tone="accent">{like.like_type.label}</Badge>
          )}
          <LikeStatusLabel like={like} />
        </div>
        <h1 className="text-2xl leading-snug font-black text-primary">
          {like.job_posting.title}
        </h1>
        <p className="text-xs text-ink-sub">
          いいねした日時 {formatDateTime(like.created_at)}
        </p>
      </header>

      <StatusMessage like={like} />

      <PageSection title="送った志望動機">
        <MultilineText text={like.motivation} />
      </PageSection>

      <PageSection title="応募先の求人">
        <div className="max-w-md">
          <JobCard job={like.job_posting} />
        </div>
      </PageSection>
    </div>
  );
}

/** 今の状況の説明(マッチなら連絡の案内、期限切れならもう一度いいねできること) */
function StatusMessage({ like }: { like: SeekerLike }) {
  switch (like.status.value) {
    case "applied":
      return (
        <Card className="px-5 py-5 text-sm leading-relaxed text-ink-body">
          企業からの返事を待っています。返事の期限は
          <span className="font-bold">
            {formatMonthDay(like.response_deadline)}(残り
            {daysUntil(like.response_deadline)}日)
          </span>
          です。期限までに返事がなければ、自動で不成立になります。
        </Card>
      );
    case "matched":
      return (
        <Card className="flex flex-col gap-2 bg-tint px-5 py-5 text-sm leading-relaxed text-ink-body">
          <p className="flex items-center gap-2 text-base font-bold text-primary">
            <Mail className="size-5" aria-hidden />
            マッチしました
          </p>
          <p>
            企業から、登録しているメールアドレス宛に連絡が届きます。迷惑メールのフォルダも確認してください。
          </p>
        </Card>
      );
    case "declined":
      return (
        <Card className="px-5 py-5 text-sm leading-relaxed text-ink-body">
          今回は見送りとなりました。同じ求人には、もう一度いいねできません。
        </Card>
      );
    default:
      return (
        <Card className="px-5 py-5 text-sm leading-relaxed text-ink-body">
          期限内に企業から返事がなかったため、不成立となりました。この求人には
          <Link
            href={`/jobs/${like.job_posting.id}`}
            className="font-bold text-primary underline underline-offset-4"
          >
            もう一度いいね
          </Link>
          できます。
        </Card>
      );
  }
}
