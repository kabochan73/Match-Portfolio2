import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { SeekerRegisterForm } from "@/components/auth/SeekerRegisterForm";

export const metadata: Metadata = {
  title: "会員登録 | Tech Match",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="無料で会員登録"
      description="登録後は、そのまま求人を探していいね(応募)できます。職歴などのプロフィールは後から登録できます。"
      footer={
        <p className="text-ink-body">
          すでにアカウントをお持ちの方は
          <Link
            href="/login"
            className="font-bold text-primary underline underline-offset-4"
          >
            ログイン
          </Link>
        </p>
      }
    >
      <SeekerRegisterForm />
    </AuthCard>
  );
}
