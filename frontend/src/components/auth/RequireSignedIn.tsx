import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentCompany } from "@/lib/company/api";
import { getCurrentSeeker } from "@/lib/seeker/api";

type RequireSignedInProps = {
  /** どちらでログインしている必要があるか */
  as: "seeker" | "company";
  children: ReactNode;
};

const LOGIN_PATHS = {
  seeker: "/login",
  company: "/company/login",
} as const;

/**
 * ログインが必要なページの認証ガード。ログインしていなければログイン画面へ移動させ、していれば中身を描画する。
 * Cookieを読むため<Suspense>の中に置く
 */
export async function RequireSignedIn({ as, children }: RequireSignedInProps) {
  const signedIn =
    as === "seeker" ? await getCurrentSeeker() : await getCurrentCompany();

  if (!signedIn) {
    redirect(LOGIN_PATHS[as]);
  }

  return children;
}
