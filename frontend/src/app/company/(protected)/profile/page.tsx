import type { Metadata } from "next";

import { CompanyProfileView } from "@/components/company/CompanyProfileView";
import { WideMain } from "@/components/layout/WideMain";

export const metadata: Metadata = {
  title: "企業ページ | Tech Match",
};

/**
 * 自社の企業ページ(管理)。公開の企業ページとまったく同じ見え方にするため、
 * 管理画面の幅と余白の制限を外し(WideMainのfull)、端まで広がる帯もそのまま出す
 */
export default function CompanyProfilePage() {
  return (
    <>
      <WideMain layout="full" />
      <CompanyProfileView />
    </>
  );
}
