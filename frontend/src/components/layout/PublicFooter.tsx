import { getCurrentSeeker } from "@/lib/seeker/api";

import { Footer, signedInSeekerFooterLinks } from "./Footer";

/**
 * 誰でも閲覧できるページのフッター。ログイン中ならログイン・会員登録のリンクを出さない。Cookieを読むため、<Suspense>の中に置く
 */
export async function PublicFooter() {
  const seeker = await getCurrentSeeker();

  return seeker ? <Footer links={signedInSeekerFooterLinks} /> : <Footer />;
}

/**
 * ログイン状態を確かめる間に出すフッター。ログイン中の人に「ログイン」が一瞬見えないよう、ログイン後のリンクで出しておく
 */
export function PublicFooterSkeleton() {
  return <Footer links={signedInSeekerFooterLinks} />;
}
