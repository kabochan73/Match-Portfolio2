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

// 項目名はLaravelのAPIと同じにし、サーバーの入力エラーをそのまま各項目に表示できるようにする。
// パスワードの強さや年齢などの細かいルールはサーバーで確かめる
const registerSchema = z
  .object({
    name: z.string().trim().min(1, "名前を入力してください"),
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .pipe(z.email("メールアドレスの形式で入力してください")),
    password: z.string().min(1, "パスワードを入力してください"),
    password_confirmation: z
      .string()
      .min(1, "確認のため、もう一度パスワードを入力してください"),
    birth_date: z.string().min(1, "生年月日を入力してください"),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "パスワードが一致しません",
    path: ["password_confirmation"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const FIELDS = [
  "name",
  "email",
  "password",
  "password_confirmation",
  "birth_date",
] as const;

/**
 * 求職者の会員登録フォーム。登録と同時にログイン状態になるため、成功したら求人一覧(または?redirect=の画面)へ移動する
 */
export function SeekerRegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const registration = useMutation({
    mutationFn: (values: RegisterValues) =>
      apiClientFetch("/seeker/register", { method: "POST", body: values }),
    onSuccess: () => {
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      router.replace(safeRedirectPath(redirect, "/jobs"));
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
        label="名前"
        autoComplete="name"
        placeholder="例: 山田 太郎"
        error={errors.name?.message}
        {...register("name")}
      />
      <FormField
        label="メールアドレス"
        type="email"
        autoComplete="email"
        hint="マッチした企業からの連絡は、このメールアドレスに届きます"
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
      <FormField
        label="生年月日"
        type="date"
        autoComplete="bday"
        hint="応募先の企業には年齢だけが表示されます"
        error={errors.birth_date?.message}
        {...register("birth_date")}
      />
      <Button
        type="submit"
        size="lg"
        variant="accent"
        withShadow
        disabled={registration.isPending}
        className="mt-2 w-full"
      >
        {registration.isPending ? "登録中…" : "無料で会員登録"}
      </Button>
    </form>
  );
}
