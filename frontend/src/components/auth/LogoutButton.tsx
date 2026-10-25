"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { iconLinkClass } from "@/components/ui/IconLink";
import { apiClientFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type LogoutButtonProps = {
  endpoint: "/seeker/logout" | "/company/logout";
  /** ログアウト後の移動先(求職者はトップページ、企業は企業向けページ) */
  redirectTo: string;
  className?: string;
  /** ヘッダーのアイコンと並べるため、文字の代わりにアイコンで出す */
  iconOnly?: boolean;
};

/**
 * ログアウトボタン。確認ダイアログを出してからログアウトし、redirectToへ移動してログイン状態で表示が変わる部分を描き直す
 */
export function LogoutButton({
  endpoint,
  redirectTo,
  className,
  iconOnly = false,
}: LogoutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // 押し間違いでログアウトしないよう、確認してから実行する
  const [confirming, setConfirming] = useState(false);

  const logout = useMutation({
    mutationFn: () => apiClientFetch(endpoint, { method: "POST" }),
    onSuccess: () => {
      // ログイン中に取得した本人のデータを、次の人に見せないよう消しておく
      queryClient.clear();
      router.replace(redirectTo);
      router.refresh();
    },
  });

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          aria-label="ログアウト"
          title="ログアウト"
          onClick={() => setConfirming(true)}
          className={cn(iconLinkClass, className)}
        >
          <LogOut className="size-5" aria-hidden />
        </button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setConfirming(true)}
          className={className}
        >
          ログアウト
        </Button>
      )}

      <ConfirmDialog
        open={confirming}
        title="ログアウトしますか?"
        confirmLabel="ログアウト"
        pending={logout.isPending}
        onConfirm={() => logout.mutate()}
        onClose={() => setConfirming(false)}
      >
        ほんとうにログアウトしますか？
      </ConfirmDialog>
    </>
  );
}
