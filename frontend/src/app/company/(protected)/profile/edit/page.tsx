import type { Metadata } from "next";

import { CompanyProfileEditor } from "@/components/company/CompanyProfileForm";

export const metadata: Metadata = {
  title: "企業ページ編集 | Tech Match",
};

export default function CompanyProfileEditPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black text-primary">企業ページ編集</h1>
      <CompanyProfileEditor />
    </div>
  );
}
