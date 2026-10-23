"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormField } from "@/components/ui/FormField";
import { apiClientFetch } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";

const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "新しいパスワードを入力してください"),
    password_confirmation: z
      .string()
      .min(1, "確認のため、もう一度パスワードを入力してください"),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "パスワードが一致しません",
    path: ["password_confirmation"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordFormProps = {
  endpoint: "/seeker/reset-password" | "/company/reset-password";
  /** 再設定後に移動するログイン画面 */
  loginPath: "/login" | "/company/login";
};

/** メールのリンクに付いていない(URLを手で書き換えたなど)ときのメッセージ */
const INVALID_LINK_MESSAGE =
  "再設定用のリンクが正しくありません。メールに記載のリンクから開き直してください。";

/**
 * 新しいパスワードの設定フォーム。メールのリンクのURL(?token=…&email=…)から、再設定に必要な値を読む。
 * 成功したらログイン画面へ移動し、再設定できたことを伝える
 */
export function ResetPasswordForm({
  endpoint,
  loginPath,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const reset = useMutation({
    mutationFn: (values: ResetPasswordValues) => {
      // ページを静的なまま配信するため、URLは送信するときにブラウザで読む
      const query = new URLSearchParams(window.location.search);
      const token = query.get("token");
      const email = query.get("email");

      if (!token || !email) {
        throw new Error(INVALID_LINK_MESSAGE);
      }

      return apiClientFetch(endpoint, {
        method: "POST",
        body: { ...values, token, email },
      });
    },
    onSuccess: () => router.replace(`${loginPath}?reset=1`),
    onError: (error) => {
      if (error.message === INVALID_LINK_MESSAGE) {
        setError("root", { message: INVALID_LINK_MESSAGE });
        return;
      }

      // リンクの期限切れなどは、emailの項目のエラーとして返る(画面にemailの欄はないため、フォーム全体のエラーになる)
      applyServerErrors(error, setError, ["password", "password_confirmation"]);
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => reset.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={errors.root?.message} />
      <FormField
        label="新しいパスワード"
        type="password"
        autoComplete="new-password"
        hint="8文字以上"
        error={errors.password?.message}
        {...register("password")}
      />
      <FormField
        label="新しいパスワード(確認)"
        type="password"
        autoComplete="new-password"
        error={errors.password_confirmation?.message}
        {...register("password_confirmation")}
      />
      <Button
        type="submit"
        size="lg"
        withShadow
        disabled={reset.isPending}
        className="mt-2 w-full"
      >
        {reset.isPending ? "設定中…" : "パスワードを再設定する"}
      </Button>
    </form>
  );
}
