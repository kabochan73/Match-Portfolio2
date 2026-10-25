import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JobPostingManager } from "@/components/company/JobPostingManager";

export const metadata: Metadata = {
  title: "求人の管理 | Tech Match",
};

/**
 * 求人の詳細(管理)。公開ページと同じ並びのため、幅も公開ページにそろえる(data-layout="wide")。
 * どの求人かはURLで決まるため、URLを読む部分を<Suspense>で囲む
 */
export default function CompanyJobPostingPage({
  params,
}: PageProps<"/company/job-postings/[id]">) {
  return (
    <div data-layout="wide">
      <Suspense>
        {params.then(({ id }) => {
          if (!/^[1-9]\d*$/.test(id)) {
            notFound();
          }

          return <JobPostingManager id={Number(id)} />;
        })}
      </Suspense>
    </div>
  );
}
