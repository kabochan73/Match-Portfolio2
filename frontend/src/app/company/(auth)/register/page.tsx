import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { CompanyRegisterForm } from "@/components/auth/CompanyRegisterForm";

export const metadata: Metadata = {
  title: "企業の会員登録 | Tech Match",
};

export default function CompanyRegisterPage() {
  return (
    <AuthCard
      title="無料で掲載をはじめる"
      description="登録は会社名・メールアドレス・パスワードだけ。審査はありません。企業ページや求人は登録後に作成できます。"
      footer={
        <p className="text-ink-body">
          すでにアカウントをお持ちの方は
          <Link
            href="/company/login"
            className="font-bold text-primary underline underline-offset-4"
          >
            企業ログイン
          </Link>
        </p>
      }
    >
      {/* 管理画面ができるまでは、登録後は企業向けページへ */}
      <CompanyRegisterForm redirectTo="/for-companies" />
    </AuthCard>
  );
}
