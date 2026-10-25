import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { PasswordResetNotice } from "@/components/auth/PasswordResetNotice";

export const metadata: Metadata = {
  title: "企業ログイン | Tech Match",
};

export default function CompanyLoginPage() {
  return (
    <AuthCard
      title="企業ログイン"
      footer={
        <>
          <Link
            href="/company/forgot-password"
            className="font-bold text-primary underline underline-offset-4"
          >
            パスワードを忘れた方
          </Link>
          <p className="text-ink-body">
            はじめての方は
            <Link
              href="/company/register"
              className="font-bold text-primary underline underline-offset-4"
            >
              無料で掲載をはじめる
            </Link>
          </p>
          <Link
            href="/login"
            className="py-2 font-bold text-ink-sub underline underline-offset-4"
          >
            求職者の方はこちら
          </Link>
        </>
      }
    >
      <Suspense>
        <PasswordResetNotice />
      </Suspense>
      <LoginForm
        endpoint="/company/login"
        defaultRedirect="/company/job-postings"
        demoAccount={{
          email: "demo-company@example.com",
          password: "password1234",
        }}
      />
    </AuthCard>
  );
}
