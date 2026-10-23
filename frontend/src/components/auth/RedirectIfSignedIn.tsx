import { redirect } from "next/navigation";

import { getCurrentSeeker } from "@/lib/seeker/api";

/**
 * ログイン中の求職者がログイン・会員登録の画面を開いたら、求人一覧へ移動させる。
 * Cookieを読むため<Suspense>の中に置く(描画を始めた後でも、ブラウザ側で移動させる仕組みをNext.jsが入れる)
 */
export async function RedirectIfSignedIn() {
  if (await getCurrentSeeker()) {
    redirect("/jobs");
  }

  return null;
}
