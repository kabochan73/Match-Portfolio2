import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "新しいパスワードの設定(企業) | Tech Match",
};

/**
 * メールのリンク(?token=…&email=…)から開く画面。URLはフォームが送信時に読むため、ページは静的なまま配信する
 */
export default function CompanyResetPasswordPage() {
  return (
    <AuthCard
      title="新しいパスワードの設定(企業)"
      footer={
        <p className="text-ink-body">
          リンクの期限が切れた方は
          <Link
            href="/company/forgot-password"
            className="font-bold text-primary underline underline-offset-4"
          >
            もう一度メールを送る
          </Link>
        </p>
      }
    >
      <ResetPasswordForm
        endpoint="/company/reset-password"
        loginPath="/company/login"
      />
    </AuthCard>
  );
}
