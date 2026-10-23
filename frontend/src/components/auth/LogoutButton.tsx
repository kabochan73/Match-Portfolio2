"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { apiClientFetch } from "@/lib/api/client";

type LogoutButtonProps = {
  endpoint: "/seeker/logout" | "/company/logout";
  /** ログアウト後の移動先(求職者はトップページ、企業は企業向けページ) */
  redirectTo: string;
  className?: string;
};

/**
 * ログアウトボタン。ログアウトしたらredirectToへ移動し、ログイン状態で表示が変わる部分を描き直す
 */
export function LogoutButton({
  endpoint,
  redirectTo,
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

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
    <Button
      variant="secondary"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      className={className}
    >
      {logout.isPending ? "ログアウト中…" : "ログアウト"}
    </Button>
  );
}
