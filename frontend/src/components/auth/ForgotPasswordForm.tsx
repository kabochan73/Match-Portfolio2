"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormField } from "@/components/ui/FormField";
import { apiClientFetch } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .pipe(z.email("メールアドレスの形式で入力してください")),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordFormProps = {
  endpoint: "/seeker/forgot-password" | "/company/forgot-password";
};

/**
 * パスワード再設定メールの送信フォーム。
 * 登録されているメールアドレスかどうかを推測されないよう、送信後は登録の有無にかかわらず同じ案内を出す
 */
export function ForgotPasswordForm({ endpoint }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const sendLink = useMutation({
    mutationFn: (values: ForgotPasswordValues) =>
      apiClientFetch(endpoint, { method: "POST", body: values }),
    onError: (error) => applyServerErrors(error, setError, ["email"]),
  });

  if (sendLink.isSuccess) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-4">
        <MailCheck className="size-10 text-primary" aria-hidden />
        <p className="text-center text-sm leading-relaxed text-ink-body">
          登録されているメールアドレスであれば、パスワード再設定用のメールを送信しました。メールに記載のリンクから、新しいパスワードを設定してください。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => sendLink.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={errors.root?.message} />
      <FormField
        label="メールアドレス"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button
        type="submit"
        size="lg"
        withShadow
        disabled={sendLink.isPending}
        className="mt-2 w-full"
      >
        {sendLink.isPending ? "送信中…" : "再設定用のメールを送る"}
      </Button>
    </form>
  );
}
