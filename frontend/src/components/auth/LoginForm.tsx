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
import { safeRedirectPath } from "@/lib/auth/redirect";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";

// 細かいルールはサーバーで確かめ、ここでは送る前に分かる入力漏れ・形式の間違いだけを見る
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .pipe(z.email("メールアドレスの形式で入力してください")),
  password: z.string().min(1, "パスワードを入力してください"),
});

type LoginValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  /** 送信先(求職者と企業で同じフォームを使う) */
  endpoint: "/seeker/login" | "/company/login";
  /** ?redirect=がないときのログイン後の移動先 */
  defaultRedirect: string;
};

/**
 * ログインフォーム。成功したら?redirect=の画面(なければdefaultRedirect)へ移動する
 */
export function LoginForm({ endpoint, defaultRedirect }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const login = useMutation({
    mutationFn: (values: LoginValues) =>
      apiClientFetch(endpoint, { method: "POST", body: values }),
    onSuccess: () => {
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      router.replace(safeRedirectPath(redirect, defaultRedirect));
      // ヘッダーなど、ログイン状態で表示が変わるServer Componentを描画し直す
      router.refresh();
    },
    onError: (error) =>
      applyServerErrors(error, setError, ["email", "password"]),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => login.mutate(values))}
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
      <FormField
        label="パスワード"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button
        type="submit"
        size="lg"
        withShadow
        disabled={login.isPending}
        className="mt-2 w-full"
      >
        {login.isPending ? "ログイン中…" : "ログイン"}
      </Button>
    </form>
  );
}
