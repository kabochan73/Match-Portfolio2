import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CompanyFacts } from "@/components/companies/CompanyFacts";
import { JobCard } from "@/components/jobs/JobCard";
import { Gallery } from "@/components/ui/Gallery";
import { MultilineText, PageSection } from "@/components/ui/PageSection";
import type { PublicCompany } from "@/lib/api/types";
import { getCompany } from "@/lib/companies/api";

/** 検索結果などに出す説明文の長さ */
const DESCRIPTION_LENGTH = 120;

export async function generateMetadata({
  params,
}: PageProps<"/companies/[id]">): Promise<Metadata> {
  const company = await findCompany((await params).id);

  return {
    title: `${company.name} | Tech Match`,
    description: (
      company.introduction ??
      company.business_description ??
      ""
    ).slice(0, DESCRIPTION_LENGTH),
  };
}

/**
 * 企業ページ。PCは本文と会社情報の2カラム、スマホは会社情報を本文の上に置く1カラム。
 * どの企業かはURLで決まるため、中身はすべて<Suspense>の中で描画する(企業のデータ自体は企業ごとにキャッシュ)
 */
export default function CompanyPage({ params }: PageProps<"/companies/[id]">) {
  return (
    <Suspense fallback={<CompanySkeleton />}>
      {params.then(({ id }) => (
        <CompanyContent id={id} />
      ))}
    </Suspense>
  );
}

/**
 * 企業を取得する。IDが数字でない・存在しない場合は404ページにする
 */
async function findCompany(id: string): Promise<PublicCompany> {
  const company = /^[1-9]\d*$/.test(id) ? await getCompany(Number(id)) : null;

  if (!company) {
    notFound();
  }

  return company;
}

async function CompanyContent({ id }: { id: string }) {
  const company = await findCompany(id);
  const images = company.images ?? [];
  const jobPostings = company.job_postings ?? [];

  return (
    <>
      <header className="border-b-2 border-primary bg-tint-strong">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-10 sm:px-6 sm:py-12">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden border-2 border-primary bg-white text-3xl font-black text-primary shadow-hard-sm sm:size-24">
            {company.avatar_url ? (
              <Image
                src={company.avatar_url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                preload
              />
            ) : (
              company.name.slice(0, 1)
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl leading-snug font-black text-primary sm:text-3xl">
              {company.name}
            </h1>
            {company.introduction && (
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink-body sm:text-base">
                {company.introduction}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_320px] lg:gap-10">
        {/* スマホでは会社情報を本文より先に見せる */}
        <aside className="lg:sticky lg:top-6 lg:order-last">
          <CompanyFacts company={company} />
        </aside>

        <div className="flex min-w-0 flex-col gap-10">
          {/* 企業ページの写真は任意のため、ないときは枠も出さない */}
          {images.length > 0 && (
            <Gallery images={images} title={company.name} />
          )}

          {company.culture && (
            <PageSection title="カルチャー">
              <MultilineText text={company.culture} />
            </PageSection>
          )}

          {company.business_description && (
            <PageSection title="事業内容">
              <MultilineText text={company.business_description} />
            </PageSection>
          )}

          <PageSection title={`募集中の求人(${jobPostings.length}件)`}>
            {jobPostings.length > 0 ? (
              <ul className="grid gap-6 sm:grid-cols-2">
                {jobPostings.map((job) => (
                  <li key={job.id}>
                    <JobCard job={job} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-2 border-dashed border-line-soft bg-white px-6 py-12 text-center text-sm text-ink-sub">
                現在募集中の求人はありません。
              </p>
            )}
          </PageSection>
        </div>
      </div>
    </>
  );
}

/** 企業を読み込む間に出す、ページの形の枠 */
function CompanySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-44 border-b-2 border-primary bg-tint-strong" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_320px] lg:gap-10">
        <div className="aspect-video border-2 border-primary/30 bg-white" />
        <div className="h-72 border-2 border-primary/30 bg-white" />
      </div>
    </div>
  );
}
