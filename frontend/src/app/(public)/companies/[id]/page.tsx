import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  CompanyProfileLayout,
  CompanyProfileSkeleton,
} from "@/components/companies/CompanyProfileSections";
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
    <Suspense fallback={<CompanyProfileSkeleton />}>
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

  return (
    <CompanyProfileLayout
      company={company}
      jobPostings={company.job_postings ?? []}
    />
  );
}
