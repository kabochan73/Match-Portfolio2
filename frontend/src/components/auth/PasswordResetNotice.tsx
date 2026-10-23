"use client";

import { CircleCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

/**
 * パスワードを再設定した直後(?reset=1)に、ログイン画面の上に出す案内。
 * URLを読むため<Suspense>の中に置く(ログイン画面の残りは静的なまま配信される)
 */
export function PasswordResetNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("reset") !== "1") {
    return null;
  }

  return (
    <p
      role="status"
      className="mb-5 flex items-start gap-2 border-2 border-primary bg-tint px-4 py-3 text-sm font-bold text-primary"
    >
      <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      パスワードを再設定しました。新しいパスワードでログインしてください。
    </p>
  );
}
