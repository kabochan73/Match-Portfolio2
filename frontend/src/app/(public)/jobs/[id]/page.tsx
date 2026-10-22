import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { CompanySection } from "@/components/jobs/CompanySection";
import { JobConditions } from "@/components/jobs/JobConditions";
import { JobGallery } from "@/components/jobs/JobGallery";
import { SelectionSteps } from "@/components/jobs/SelectionSteps";
import { Badge } from "@/components/ui/Badge";
import type { JobPostingDetail } from "@/lib/api/types";
import { getJob } from "@/lib/jobs/api";

/** 検索結果などに出す説明文の長さ */
const DESCRIPTION_LENGTH = 120;

export async function generateMetadata({
  params,
}: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const job = await findJob((await params).id);

  return {
    title: `${job.title}(${job.company.name})| Tech Match`,
    description: job.description.slice(0, DESCRIPTION_LENGTH),
  };
}

/**
 * 求人詳細。PCは本文と条件の2カラム、スマホは条件を本文の上に置く1カラム。
 * どの求人かはURLで決まるため、中身はすべて<Suspense>の中で描画する(求人のデータ自体は求人ごとにキャッシュ)
 */
export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <Suspense fallback={<JobSkeleton />}>
      {params.then(({ id }) => (
        <JobContent id={id} />
      ))}
    </Suspense>
  );
}

/**
 * 求人を取得する。IDが数字でない・下書き・存在しない場合は404ページにする
 */
async function findJob(id: string): Promise<JobPostingDetail> {
  const job = /^[1-9]\d*$/.test(id) ? await getJob(Number(id)) : null;

  if (!job) {
    notFound();
  }

  return job;
}

async function JobContent({ id }: { id: string }) {
  const job = await findJob(id);
  const isClosed = job.status.value === "closed";

  return (
    <>
      {isClosed && (
        <p className="border-b-2 border-primary bg-ink-sub px-4 py-3 text-center text-sm font-bold text-white">
          この求人は募集を終了しました
        </p>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {job.is_new && !isClosed && <Badge tone="accent">NEW</Badge>}
            {isClosed && <Badge tone="muted">募集終了</Badge>}
            <Link
              href={`/companies/${job.company.id}`}
              className="text-sm font-bold text-ink-body underline-offset-4 hover:underline"
            >
              {job.company.name}
            </Link>
          </div>
          <h1 className="text-2xl leading-snug font-black text-primary sm:text-3xl">
            {job.title}
          </h1>
        </header>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
          {/* スマホでは条件を本文より先に見せる */}
          <aside className="lg:sticky lg:top-6 lg:order-last">
            <JobConditions job={job} />
          </aside>

          <div className="flex min-w-0 flex-col gap-10">
            <JobGallery images={job.images} title={job.title} />

            <Section title="仕事内容">
              <Paragraphs text={job.description} />
            </Section>

            <Section title="求める人材">
              <Paragraphs text={job.desired_candidate} />
            </Section>

            <Section title="選考フロー">
              <SelectionSteps steps={job.selection_steps} />
            </Section>

            <Section title="この求人を出している会社">
              <CompanySection company={job.company} />
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 border-l-[6px] border-primary pl-3 text-lg font-bold text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** 企業が入力した文章。改行はそのまま表示する */
function Paragraphs({ text }: { text: string }) {
  return (
    <p className="leading-loose whitespace-pre-wrap text-ink-body">{text}</p>
  );
}

/** 求人を読み込む間に出す、ページの形の枠 */
function JobSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 sm:py-10">
      <div className="h-4 w-40 bg-tint-strong" />
      <div className="mt-4 h-9 w-2/3 bg-tint-strong" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
        <div className="aspect-video border-2 border-primary/30 bg-white" />
        <div className="h-72 border-2 border-primary/30 bg-white" />
      </div>
    </div>
  );
}
