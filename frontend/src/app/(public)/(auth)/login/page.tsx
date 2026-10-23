import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン | Tech Match",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="ログイン"
      footer={
        <>
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
      <LoginForm endpoint="/seeker/login" defaultRedirect="/jobs" />
    </AuthCard>
  );
}
