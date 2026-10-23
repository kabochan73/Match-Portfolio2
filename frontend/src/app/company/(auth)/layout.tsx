import { Suspense } from "react";

import { RedirectIfSignedIn } from "@/components/auth/RedirectIfSignedIn";
import { CompanyPublicHeader } from "@/components/layout/CompanyPublicHeader";
import { companyFooterLinks, Footer } from "@/components/layout/Footer";

/**
 * 企業のログイン・会員登録などの画面の枠。企業向けのヘッダー・フッターを使い、フォームを中央に置く。
 * 企業でログイン中なら管理画面(求人管理)へ移動させる
 */
export default function CompanyAuthLayout({
  children,
}: LayoutProps<"/company">) {
  return (
    <>
      <CompanyPublicHeader />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <Suspense>
          <RedirectIfSignedIn as="company" to="/company/job-postings" />
        </Suspense>
        {children}
      </main>
      <Footer links={companyFooterLinks} />
    </>
  );
}
