"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormAlert } from "@/components/ui/FormAlert";
import { MultilineText, PageSection } from "@/components/ui/PageSection";
import { QueryErrorNotice } from "@/components/ui/QueryErrorNotice";
import { apiClientFetch } from "@/lib/api/client";
import type { ReceivedLike } from "@/lib/api/types";
import {
  companyQueryKeys,
  receivedLikeQueryOptions,
} from "@/lib/company/queries";
import { errorMessage } from "@/lib/forms/applyServerErrors";
import { formatDateTime } from "@/lib/utils/date";

import { ApplicantProfile } from "./ApplicantProfile";
import { LikeStatusLabel } from "./LikeStatusLabel";

type Response = "match" | "decline";

/**
 * 応募者の詳細。志望動機とプロフィールを見て、反応待ちなら「気になる」か「見送り」を返す。
 * マッチしたら、連絡先のメールアドレスを出す
 */
export function ApplicantDetail({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<Response | null>(null);
  const {
    data: like,
    isPending,
    isError,
    error,
  } = useQuery(receivedLikeQueryOptions(id));

  const respond = useMutation({
    mutationFn: (response: Response) =>
      apiClientFetch(`/company/likes/${id}/${response}`, { method: "POST" }),
    onSuccess: async () => {
      setConfirming(null);
      // この応募者・応募者一覧の件数・求人管理の反応待ちの件数が変わる
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.likes }),
        queryClient.invalidateQueries({
          queryKey: companyQueryKeys.jobPostings,
        }),
      ]);
    },
    // 期限切れなどで失敗したら、ダイアログを閉じて理由を上に出す
    onError: () => setConfirming(null),
  });

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
        backHref="/company/likes"
        backLabel="応募者一覧へ戻る"
      />
    );
  }

  const { applicant } = like;

  return (
    <div className="flex flex-col gap-8">
      <FormAlert
        message={respond.isError ? errorMessage(respond.error) : undefined}
      />

      <header className="flex flex-wrap items-start gap-5">
        <Avatar src={applicant.avatar_url} name={applicant.name} size={80} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-primary">
              {applicant.name}
              <span className="ml-2 text-base font-bold text-ink-sub">
                ({applicant.age}歳)
              </span>
            </h1>
            {like.like_type.value === "super" && (
              <Badge tone="accent">{like.like_type.label}</Badge>
            )}
          </div>
          <p className="text-sm text-ink-body">
            応募先:
            <Link
              href={`/company/job-postings/${like.job_posting.id}`}
              className="ml-1 font-bold text-primary underline underline-offset-4"
            >
              {like.job_posting.title}
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-sub">
            <span>応募日時 {formatDateTime(like.created_at)}</span>
            <LikeStatusLabel like={like} />
          </div>
        </div>
      </header>

      {like.status.value === "applied" && (
        <Card className="flex flex-col gap-4 px-5 py-5">
          <p className="text-sm text-ink-body">
            志望動機とプロフィールを確認して、返事をしてください。期限を過ぎると自動で不成立になります。
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" withShadow onClick={() => setConfirming("match")}>
              気になる
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setConfirming("decline")}
            >
              見送り
            </Button>
          </div>
        </Card>
      )}

      {like.status.value === "matched" && applicant.email && (
        <ContactCard email={applicant.email} />
      )}

      <PageSection title="志望動機">
        <MultilineText text={like.motivation} />
      </PageSection>

      <ApplicantProfile applicant={applicant} />

      {confirming && (
        <ConfirmDialog
          open
          title={
            confirming === "match"
              ? "「気になる」を返しますか?"
              : "見送りますか?"
          }
          confirmLabel={confirming === "match" ? "気になる" : "見送る"}
          danger={confirming === "decline"}
          pending={respond.isPending}
          onConfirm={() => respond.mutate(confirming)}
          onClose={() => setConfirming(null)}
        >
          <ConfirmMessage like={like} response={confirming} />
        </ConfirmDialog>
      )}
    </div>
  );
}

function ConfirmMessage({
  like,
  response,
}: {
  like: ReceivedLike;
  response: Response;
}) {
  if (response === "match") {
    return (
      <>
        マッチが成立し、{like.applicant.name}
        さんのメールアドレスが表示されます。その後の連絡は、メールで行ってください。
      </>
    );
  }

  return (
    <>
      {like.applicant.name}
      さんに、見送りの結果が通知されます。この操作は取り消せません。
    </>
  );
}

/**
 * マッチ後の連絡先。メールソフトを開くリンクと、コピーするボタンを置く
 */
function ContactCard({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
  };

  return (
    <Card className="flex flex-col gap-4 border-primary bg-tint px-5 py-5">
      <div>
        <p className="font-bold text-primary">マッチが成立しました</p>
        <p className="mt-1 text-sm text-ink-body">
          面接の日程調整などは、こちらのメールアドレス宛にご連絡ください。
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 font-display text-lg font-bold break-all text-primary underline underline-offset-4"
        >
          <Mail className="size-5 shrink-0" aria-hidden />
          {email}
        </a>
        <Button variant="secondary" onClick={copy}>
          {copied ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {copied ? "コピーしました" : "コピー"}
        </Button>
      </div>
    </Card>
  );
}
