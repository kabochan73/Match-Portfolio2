import type { Metadata } from "next";
import Link from "next/link";

import { JobPostingTable } from "@/components/company/JobPostingTable";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "求人管理 | Tech Match",
};

/**
 * 求人管理(自社の求人の一覧)。一覧は本人専用のため、ブラウザからTanStack Queryで取得する
 */
export default function CompanyJobPostingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-primary">求人管理</h1>
        <Link
          href="/company/job-postings/new"
          className={buttonClass({ withShadow: true })}
        >
          求人を作成
        </Link>
      </div>
      <JobPostingTable />
    </div>
  );
}
