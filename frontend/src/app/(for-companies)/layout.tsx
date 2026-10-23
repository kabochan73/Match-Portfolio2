import { CompanyPublicHeader } from "@/components/layout/CompanyPublicHeader";
import { companyFooterLinks, Footer } from "@/components/layout/Footer";

/**
 * 企業向けページの共通の枠。見る人が企業の採用担当者のため、ヘッダー・フッターを企業向けにする
 */
export default function ForCompaniesLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <CompanyPublicHeader />
      <main className="flex-1">{children}</main>
      <Footer links={companyFooterLinks} />
    </>
  );
}
