"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import Link from "next/link";

import { CompanyProfileLayout } from "@/components/companies/CompanyProfileSections";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import {
  companyJobPostingsQueryOptions,
  companyProfileQueryOptions,
} from "@/lib/company/queries";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";

/**
 * 自社の企業ページ(管理)。公開の企業ページとまったく同じ並びで見せ、会社情報の下に操作を置く。
 * 募集中の求人は、求人管理の一覧から公開中のものを公開ページと同じ新着順で出す
 */
export function CompanyProfileView() {
  const profile = useQuery(companyProfileQueryOptions());
  const jobPostings = useQuery(companyJobPostingsQueryOptions());

  if (profile.isPending || jobPostings.isPending) {
    return null;
  }

  if (profile.isError || jobPostings.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />
      </div>
    );
  }

  const publishedJobPostings = jobPostings.data.data
    .filter((jobPosting) => jobPosting.status.value === "published")
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .map((jobPosting) => ({
      ...jobPosting,
      cover_image_url: jobPosting.cover_image_url ?? null,
    }));

  return (
    <CompanyProfileLayout
      company={profile.data}
      jobPostings={publishedJobPostings}
      jobHref={(id) => `/company/job-postings/${id}`}
      sidebarExtra={
        <Card>
          <h2 className="border-b-2 border-primary bg-tint px-5 py-4 font-bold text-primary">
            企業ページの操作
          </h2>
          <div className="flex flex-col gap-3 px-5 py-5">
            <Link
              href="/company/profile/edit"
              className={buttonClass({ variant: "secondary" })}
            >
              <Pencil className="size-4" aria-hidden />
              編集する
            </Link>
          </div>
        </Card>
      }
    />
  );
}
