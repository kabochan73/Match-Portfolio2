import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { PasswordResetNotice } from "@/components/auth/PasswordResetNotice";

export const metadata: Metadata = {
  title: "ログイン | Tech Match",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="ログイン"
      footer={
        <>
          <Link
            href="/forgot-password"
            className="font-bold text-primary underline underline-offset-4"
          >
            パスワードを忘れた方
          </Link>
          <p className="text-ink-body">
            アカウントをお持ちでない方は
            <Link
              href="/register"
              className="font-bold text-primary underline underline-offset-4"
            >
              無料で会員登録
            </Link>
          </p>
          <Link
            href="/company/login"
            className="py-2 font-bold text-ink-sub underline underline-offset-4"
          >
            企業の方はこちら
          </Link>
        </>
      }
    >
      <Suspense>
        <PasswordResetNotice />
      </Suspense>
      <LoginForm endpoint="/seeker/login" defaultRedirect="/jobs" />
    </AuthCard>
  );
}
