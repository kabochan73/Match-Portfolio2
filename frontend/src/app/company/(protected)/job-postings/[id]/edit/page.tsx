import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EditJobPostingForm } from "@/components/company/EditJobPostingForm";

export const metadata: Metadata = {
  title: "求人を編集 | Tech Match",
};

/**
 * 求人の編集。どの求人かはURLで決まるため、URLを読む部分を<Suspense>で囲む
 */
export default function EditJobPostingPage({
  params,
}: PageProps<"/company/job-postings/[id]/edit">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black text-primary">求人を編集</h1>
      <Suspense>
        {params.then(({ id }) => {
          if (!/^[1-9]\d*$/.test(id)) {
            notFound();
          }

          return <EditJobPostingForm id={Number(id)} />;
        })}
      </Suspense>
    </div>
  );
}
