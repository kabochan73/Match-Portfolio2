import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditJobPostingForm } from "@/components/company/EditJobPostingForm";

export const metadata: Metadata = {
  title: "求人を編集 | Tech Match",
};

export default async function EditJobPostingPage({
  params,
}: PageProps<"/company/job-postings/[id]/edit">) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black text-primary">求人を編集</h1>
      <EditJobPostingForm id={Number(id)} />
    </div>
  );
}
