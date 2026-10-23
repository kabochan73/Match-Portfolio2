"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, ExternalLink, Heart, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { SelectionSteps } from "@/components/jobs/SelectionSteps";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormAlert } from "@/components/ui/FormAlert";
import { QueryErrorNotice } from "@/components/ui/QueryErrorNotice";
import { MultilineText, PageSection } from "@/components/ui/PageSection";
import { Tag } from "@/components/ui/Tag";
import { apiClientFetch } from "@/lib/api/client";
import type { CompanyJobPosting } from "@/lib/api/types";
import {
  companyJobPostingQueryOptions,
  companyQueryKeys,
} from "@/lib/company/queries";
import { errorMessage } from "@/lib/forms/applyServerErrors";
import { formatSalary } from "@/lib/jobs/format";

import { JobPostingStatusBadge } from "./JobPostingStatusBadge";

type Action = "publish" | "close" | "delete";

/** 操作ごとの確認ダイアログの文言 */
const CONFIRMATIONS: Record<
  Action,
  { title: string; message: string; confirmLabel: string; danger: boolean }
> = {
  publish: {
    title: "求人を公開しますか?",
    message:
      "公開すると、求人一覧・検索に表示され、求職者がいいね(応募)できるようになります。",
    confirmLabel: "公開する",
    danger: false,
  },
  close: {
    title: "募集を終了しますか?",
    message:
      "求人一覧・検索に表示されなくなり、新しいいいね(応募)を受け付けなくなります。届いている応募には、引き続き返事ができます。あとで募集を再開することもできます。",
    confirmLabel: "募集を終了する",
    danger: false,
  },
  delete: {
    title: "求人を削除しますか?",
    message: "削除した求人は元に戻せません。",
    confirmLabel: "削除する",
    danger: true,
  },
};

/**
 * 求人の詳細(管理)。内容の確認と、公開・募集終了・募集再開・削除・編集の操作を置く
 */
export function JobPostingManager({ id }: { id: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<Action | null>(null);
  const {
    data: jobPosting,
    isPending,
    isError,
    error,
  } = useQuery(companyJobPostingQueryOptions(id));

  const act = useMutation({
    mutationFn: (action: Action) =>
      action === "delete"
        ? apiClientFetch(`/company/job-postings/${id}`, { method: "DELETE" })
        : apiClientFetch(`/company/job-postings/${id}/${action}`, {
            method: "POST",
          }),
    onSuccess: async (_, action) => {
      setConfirming(null);

      if (action === "delete") {
        queryClient.removeQueries({
          queryKey: companyQueryKeys.jobPosting(id),
        });
        await queryClient.invalidateQueries({
          queryKey: companyQueryKeys.jobPostings,
          exact: true,
        });
        router.push("/company/job-postings");
        return;
      }

      // 状態が変わったため、この求人と一覧を取り直す
      await queryClient.invalidateQueries({
        queryKey: companyQueryKeys.jobPostings,
      });
    },
    // 公開中の上限(10件)などで失敗したら、ダイアログを閉じて理由を上に出す
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
        notFoundMessage="この求人は見つかりませんでした。削除されたか、URLが間違っている可能性があります。"
        backHref="/company/job-postings"
        backLabel="求人管理へ戻る"
      />
    );
  }

  const status = jobPosting.status.value;
  // いいねが1件でもある求人は削除できない(募集終了にする)
  const canDelete = jobPosting.likes_count === 0;

  return (
    <div className="flex flex-col gap-6">
      <FormAlert message={act.isError ? errorMessage(act.error) : undefined} />

      <header className="flex flex-col gap-3">
        <div>
          <JobPostingStatusBadge status={jobPosting.status} />
        </div>
        <h1 className="text-2xl leading-snug font-black text-primary">
          {jobPosting.title}
        </h1>
        <ApplicationSummary jobPosting={jobPosting} />
      </header>

      <div className="flex flex-wrap gap-3">
        {status === "draft" && (
          <Button withShadow onClick={() => setConfirming("publish")}>
            公開する
          </Button>
        )}
        {status === "published" && (
          <Button variant="secondary" onClick={() => setConfirming("close")}>
            募集を終了する
          </Button>
        )}
        {status === "closed" && (
          <Button withShadow onClick={() => setConfirming("publish")}>
            募集を再開する
          </Button>
        )}
        <Link
          href={`/company/job-postings/${id}/edit`}
          className={buttonClass({ variant: "secondary" })}
        >
          編集する
        </Link>
        {status !== "draft" && (
          <a
            href={`/jobs/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: "secondary" })}
          >
            公開ページを見る
            <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
        {canDelete && (
          <Button variant="secondary" onClick={() => setConfirming("delete")}>
            削除する
          </Button>
        )}
      </div>

      <Card className="px-5 py-5">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <Condition label="職種">
            <span className="flex flex-wrap gap-1.5">
              {jobPosting.job_categories.map((jobCategory) => (
                <Tag key={jobCategory.id} variant="solid">
                  {jobCategory.name}
                </Tag>
              ))}
            </span>
          </Condition>
          <Condition label="技術">
            {jobPosting.tech_stacks && jobPosting.tech_stacks.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {jobPosting.tech_stacks.map((techStack) => (
                  <Tag key={techStack.id}>{techStack.name}</Tag>
                ))}
              </span>
            ) : (
              <span className="text-ink-sub">未設定</span>
            )}
          </Condition>
          <Condition label="雇用形態">
            {jobPosting.employment_type.label}
          </Condition>
          <Condition label="勤務地">{jobPosting.prefecture.label}</Condition>
          <Condition label="月給">
            {formatSalary(jobPosting.salary)}円
          </Condition>
        </dl>
      </Card>

      <PageSection title="仕事内容">
        <MultilineText text={jobPosting.description} />
      </PageSection>
      <PageSection title="求める人材">
        <MultilineText text={jobPosting.desired_candidate} />
      </PageSection>
      <PageSection title="選考フロー">
        <SelectionSteps steps={jobPosting.selection_steps} />
      </PageSection>

      {confirming && (
        <ConfirmDialog
          open
          title={
            confirming === "publish" && status === "closed"
              ? "募集を再開しますか?"
              : CONFIRMATIONS[confirming].title
          }
          confirmLabel={
            confirming === "publish" && status === "closed"
              ? "募集を再開する"
              : CONFIRMATIONS[confirming].confirmLabel
          }
          danger={CONFIRMATIONS[confirming].danger}
          pending={act.isPending}
          onConfirm={() => act.mutate(confirming)}
          onClose={() => setConfirming(null)}
        >
          {CONFIRMATIONS[confirming].message}
        </ConfirmDialog>
      )}
    </div>
  );
}

/** 応募の件数と、応募者一覧へのリンク(反応待ちがあれば赤で知らせる) */
function ApplicationSummary({ jobPosting }: { jobPosting: CompanyJobPosting }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      <span className="flex items-center gap-1 text-ink-body">
        <Heart className="size-4 text-accent" aria-hidden />
        応募
        <span className="font-display font-bold">{jobPosting.likes_count}</span>
        件
      </span>
      {jobPosting.pending_likes_count > 0 && (
        <span className="flex items-center gap-1 font-bold text-accent">
          <CircleAlert className="size-4" aria-hidden />
          反応待ち
          <span className="font-display">{jobPosting.pending_likes_count}</span>
          件
        </span>
      )}
      {jobPosting.likes_count > 0 && (
        <Link
          href={`/company/likes?job_posting_id=${jobPosting.id}`}
          className="flex items-center gap-1 font-bold text-primary underline underline-offset-4"
        >
          <Users className="size-4" aria-hidden />
          この求人の応募者を見る
        </Link>
      )}
    </div>
  );
}

function Condition({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-start gap-2">
      <dt className="pt-0.5 text-xs font-bold text-ink-sub">{label}</dt>
      <dd className="text-ink-body">{children}</dd>
    </div>
  );
}
