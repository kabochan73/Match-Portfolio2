import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ApplicantDetail } from "@/components/company/ApplicantDetail";

export const metadata: Metadata = {
  title: "応募者の詳細 | Tech Match",
};

/**
 * 応募者の詳細。どの応募かはURLで決まるため、URLを読む部分を<Suspense>で囲む
 */
export default function CompanyLikePage({
  params,
}: PageProps<"/company/likes/[id]">) {
  return (
    <Suspense>
      {params.then(({ id }) => {
        if (!/^[1-9]\d*$/.test(id)) {
          notFound();
        }

        return <ApplicantDetail id={Number(id)} />;
      })}
    </Suspense>
  );
}
