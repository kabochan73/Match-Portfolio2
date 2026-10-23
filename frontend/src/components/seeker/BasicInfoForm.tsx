"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormField } from "@/components/ui/FormField";
import { FormSuccess } from "@/components/ui/FormSuccess";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { apiClientFetch } from "@/lib/api/client";
import type { SeekerProfile } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import { seekerQueryKeys } from "@/lib/seeker/queries";

/** 自己紹介の上限(Laravelのバリデーションと合わせる) */
const COMMENT_LIMIT = 200;

// 年齢(18〜60歳)などの細かいルールはサーバーで確かめる
const basicInfoSchema = z.object({
  name: z.string().trim().min(1, "名前を入力してください"),
  birth_date: z.string().min(1, "生年月日を入力してください"),
  comment: z
    .string()
    .trim()
    .max(COMMENT_LIMIT, `${COMMENT_LIMIT}文字以内で入力してください`),
  portfolio_url: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\/\S+$/.test(value),
      "http://またはhttps://から始まるURLを入力してください",
    ),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

/**
 * プロフィールの基本情報(名前・生年月日・自己紹介・ポートフォリオ)。メールアドレスはここでは変えられない
 */
export function BasicInfoForm({ profile }: { profile: SeekerProfile }) {
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: profile.name,
      birth_date: profile.birth_date,
      comment: profile.comment ?? "",
      portfolio_url: profile.portfolio_url ?? "",
    },
  });
  const comment = useWatch({ control, name: "comment" });

  const save = useMutation({
    mutationFn: (values: BasicInfoValues) =>
      apiClientFetch("/seeker/profile", {
        method: "PUT",
        body: {
          ...values,
          // 空欄は未入力として送る
          comment: values.comment || null,
          portfolio_url: values.portfolio_url || null,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: seekerQueryKeys.profile }),
    onError: (error) =>
      applyServerErrors(error, setError, [
        "name",
        "birth_date",
        "comment",
        "portfolio_url",
      ]),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => save.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={errors.root?.message} />
      <FormSuccess message={save.isSuccess ? "保存しました。" : undefined} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="名前"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          label="生年月日"
          type="date"
          autoComplete="bday"
          hint="企業には年齢だけが表示されます"
          error={errors.birth_date?.message}
          {...register("birth_date")}
        />
      </div>
      <TextAreaField
        label="自己紹介"
        id="comment"
        limit={COMMENT_LIMIT}
        length={comment.length}
        error={errors.comment?.message}
        className="min-h-28"
        placeholder="得意な技術や、仕事で大切にしていることなど"
        {...register("comment")}
      />
      <FormField
        label="ポートフォリオURL"
        type="url"
        inputMode="url"
        placeholder="https://github.com/your-name"
        hint="GitHub・個人サイトなど"
        error={errors.portfolio_url?.message}
        {...register("portfolio_url")}
      />
      <div>
        <Button type="submit" withShadow disabled={save.isPending}>
          {save.isPending ? "保存中…" : "基本情報を保存"}
        </Button>
      </div>
    </form>
  );
}
