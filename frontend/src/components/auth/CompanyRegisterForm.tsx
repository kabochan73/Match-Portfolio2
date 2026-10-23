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

// 項目名はLaravelのAPIと同じにする。企業ページの項目(紹介文など)は登録後に編集画面で入力する
const registerSchema = z
  .object({
    name: z.string().trim().min(1, "会社名を入力してください"),
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .pipe(z.email("メールアドレスの形式で入力してください")),
    password: z.string().min(1, "パスワードを入力してください"),
    password_confirmation: z
      .string()
      .min(1, "確認のため、もう一度パスワードを入力してください"),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "パスワードが一致しません",
    path: ["password_confirmation"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const FIELDS = ["name", "email", "password", "password_confirmation"] as const;

type CompanyRegisterFormProps = {
  /** 登録後の移動先(登録と同時にログイン状態になる) */
  redirectTo: string;
};

/**
 * 企業の会員登録フォーム
 */
export function CompanyRegisterForm({ redirectTo }: CompanyRegisterFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const registration = useMutation({
    mutationFn: (values: RegisterValues) =>
      apiClientFetch("/company/register", { method: "POST", body: values }),
    onSuccess: () => {
      router.replace(redirectTo);
      router.refresh();
    },
    onError: (error) => applyServerErrors(error, setError, FIELDS),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => registration.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={errors.root?.message} />
      <FormField
        label="会社名"
        autoComplete="organization"
        placeholder="例: 株式会社テックマッチ"
        error={errors.name?.message}
        {...register("name")}
      />
      <FormField
        label="メールアドレス"
        type="email"
        autoComplete="email"
        hint="ログインと、パスワードの再設定に使います"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
        label="パスワード"
        type="password"
        autoComplete="new-password"
        hint="8文字以上"
        error={errors.password?.message}
        {...register("password")}
      />
      <FormField
        label="パスワード(確認)"
        type="password"
        autoComplete="new-password"
        error={errors.password_confirmation?.message}
        {...register("password_confirmation")}
      />
      <Button
        type="submit"
        size="lg"
        variant="accent"
        withShadow
        disabled={registration.isPending}
        className="mt-2 w-full"
      >
        {registration.isPending ? "登録中…" : "無料で掲載をはじめる"}
      </Button>
    </form>
  );
}
