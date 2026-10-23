import { redirect } from "next/navigation";

import { getCurrentCompany } from "@/lib/company/api";
import { getCurrentSeeker } from "@/lib/seeker/api";

type RedirectIfSignedInProps = {
  /** どちらのログイン状態を見るか */
  as: "seeker" | "company";
  /** ログイン中だったときの移動先 */
  to: string;
};

/**
 * ログイン中の人がログイン・会員登録の画面を開いたら、別の画面へ移動させる。
 * Cookieを読むため<Suspense>の中に置く(描画を始めた後でも、ブラウザ側で移動させる仕組みをNext.jsが入れる)
 */
export async function RedirectIfSignedIn({ as, to }: RedirectIfSignedInProps) {
  const signedIn =
    as === "seeker" ? await getCurrentSeeker() : await getCurrentCompany();

  if (signedIn) {
    redirect(to);
  }

  return null;
}
