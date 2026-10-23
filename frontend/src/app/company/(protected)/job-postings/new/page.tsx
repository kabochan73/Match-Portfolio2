import type { Metadata } from "next";

import { JobPostingForm } from "@/components/company/JobPostingForm";

export const metadata: Metadata = {
  title: "求人を作成 | Tech Match",
};

export default function NewJobPostingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-primary">求人を作成</h1>
        <p className="mt-1 text-sm text-ink-body">
          下書きとして保存されます。写真は保存後の編集画面から追加できます。内容を確認してから、求人の画面で公開してください。
        </p>
      </div>
      <JobPostingForm />
    </div>
  );
}
