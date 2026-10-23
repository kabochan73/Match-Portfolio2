"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { apiClientFetch } from "@/lib/api/client";

type LogoutButtonProps = {
  endpoint: "/seeker/logout" | "/company/logout";
  className?: string;
};

/**
 * ログアウトボタン。ログアウトしたらトップページへ移動し、ログイン状態で表示が変わる部分を描き直す
 */
export function LogoutButton({ endpoint, className }: LogoutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: () => apiClientFetch(endpoint, { method: "POST" }),
    onSuccess: () => {
      // ログイン中に取得した本人のデータを、次の人に見せないよう消しておく
      queryClient.clear();
      router.replace("/");
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
