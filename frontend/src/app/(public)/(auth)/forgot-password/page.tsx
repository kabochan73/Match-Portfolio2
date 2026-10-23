import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "パスワードの再設定 | Tech Match",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="パスワードの再設定"
      description="登録したメールアドレスに、パスワード再設定用のリンクを送ります。"
      footer={
        <Link
          href="/login"
          className="py-2 font-bold text-primary underline underline-offset-4"
        >
          ログイン画面に戻る
        </Link>
      }
    >
      <ForgotPasswordForm endpoint="/seeker/forgot-password" />
    </AuthCard>
  );
}
