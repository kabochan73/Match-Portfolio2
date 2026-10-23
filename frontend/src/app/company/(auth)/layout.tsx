import { Suspense } from "react";

import { RedirectIfSignedIn } from "@/components/auth/RedirectIfSignedIn";
import { CompanyPublicHeader } from "@/components/layout/CompanyPublicHeader";
import { companyFooterLinks, Footer } from "@/components/layout/Footer";

/**
 * 企業のログイン・会員登録などの画面の枠。企業向けのヘッダー・フッターを使い、フォームを中央に置く。
 * 企業でログイン中なら移動させる(管理画面ができるまでは企業向けページへ)
 */
export default function CompanyAuthLayout({
  children,
}: LayoutProps<"/company">) {
  return (
    <>
      <CompanyPublicHeader />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <Suspense>
          <RedirectIfSignedIn as="company" to="/for-companies" />
        </Suspense>
        {children}
      </main>
      <Footer links={companyFooterLinks} />
    </>
  );
}
