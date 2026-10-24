import { Suspense } from "react";

import {
  PublicFooter,
  PublicFooterSkeleton,
} from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

/**
 * 誰でも閲覧できるページ(トップ・求人・企業ページ・企業向けページ)の共通の枠
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Suspense fallback={<PublicFooterSkeleton />}>
        <PublicFooter />
      </Suspense>
    </>
  );
}
