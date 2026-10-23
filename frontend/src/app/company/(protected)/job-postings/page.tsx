import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "求人管理 | Tech Match",
};

// 仮: C-2(求人管理)で一覧に置き換える
export default function CompanyJobPostingsPage() {
  return <h1 className="text-2xl font-black text-primary">求人管理</h1>;
}
