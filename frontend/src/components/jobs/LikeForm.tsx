"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart, Sparkles } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { FieldGroup } from "@/components/ui/Field";
import { FormAlert } from "@/components/ui/FormAlert";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { apiClientFetch } from "@/lib/api/client";
import type { LikeQuotaItem } from "@/lib/api/types";
import {
  applyServerErrors,
  UNEXPECTED_ERROR_MESSAGE,
} from "@/lib/forms/applyServerErrors";
import { likeQuotaQueryOptions } from "@/lib/seeker/queries";
import { cn } from "@/lib/utils/cn";
import { formatMonthDay } from "@/lib/utils/date";

/** 志望動機の上限(Laravelのバリデーションと合わせる) */
const MOTIVATION_LIMIT = 2000;

const likeSchema = z.object({
  like_type: z.enum(["standard", "super"], {
    error: "いいねの種類を選んでください",
  }),
  motivation: z
    .string()
    .trim()
    .min(1, "志望動機を入力してください")
    .max(MOTIVATION_LIMIT, `${MOTIVATION_LIMIT}文字以内で入力してください`),
});

type LikeValues = z.infer<typeof likeSchema>;

type LikeFormProps = {
  jobPostingId: number;
  /** いいねできたあと(呼び出し側でダイアログを閉じ、状況を取り直す) */
  onLiked: () => void;
  onCancel: () => void;
};

/**
 * いいね(応募)のフォーム。通常かスーパーかを選び、志望動機を書いて送る。今月の残り回数を見せ、使い切った種類は選べなくする。
 * 月間上限・重複応募で失敗しうる操作のため、楽観的に「いいね済」にはせず、成功を確かめてから閉じる
 */
export function LikeForm({ jobPostingId, onLiked, onCancel }: LikeFormProps) {
  const { data: quota, isPending, isError } = useQuery(likeQuotaQueryOptions());

  if (isPending) {
    return <div className="h-64 animate-pulse bg-tint" />;
  }

  if (isError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  if (quota.standard.remaining === 0 && quota.super.remaining === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-ink-body">
          今月のいいねはすべて使いました。{formatMonthDay(quota.resets_at)}
          に回復します。
        </p>
        <Button variant="secondary" onClick={onCancel} className="self-end">
          閉じる
        </Button>
      </div>
    );
  }

  return (
    <LikeFormFields
      jobPostingId={jobPostingId}
      standard={quota.standard}
      superLike={quota.super}
      onLiked={onLiked}
      onCancel={onCancel}
    />
  );
}

type LikeFormFieldsProps = LikeFormProps & {
  standard: LikeQuotaItem;
  superLike: LikeQuotaItem;
};

function LikeFormFields({
  jobPostingId,
  standard,
  superLike,
  onLiked,
  onCancel,
}: LikeFormFieldsProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LikeValues>({
    resolver: zodResolver(likeSchema),
    // 通常のいいねが残っていれば通常を、なければスーパーを選んでおく
    defaultValues: {
      like_type: standard.remaining > 0 ? "standard" : "super",
      motivation: "",
    },
  });
  const motivation = useWatch({ control, name: "motivation" });

  const like = useMutation({
    mutationFn: (values: LikeValues) =>
      apiClientFetch(`/seeker/job-postings/${jobPostingId}/likes`, {
        method: "POST",
        body: values,
      }),
    onSuccess: onLiked,
    onError: (error) =>
      applyServerErrors(error, setError, ["like_type", "motivation"]),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => like.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={errors.root?.message} />

      <FieldGroup
        legend="いいねの種類"
        name="like_type"
        error={errors.like_type?.message}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <LikeTypeOption
            value="standard"
            quota={standard}
            icon={<Heart className="size-5" aria-hidden />}
            title="いいね"
            description="月5回まで"
            {...register("like_type")}
          />
          <LikeTypeOption
            value="super"
            quota={superLike}
            icon={<Sparkles className="size-5" aria-hidden />}
            title="スーパーいいね"
            description="月1回まで。特に熱意を伝えたい求人に"
            {...register("like_type")}
          />
        </div>
      </FieldGroup>

      <TextAreaField
        label="志望動機"
        id="motivation"
        limit={MOTIVATION_LIMIT}
        length={motivation.length}
        error={errors.motivation?.message}
        placeholder="この求人に応募した理由や、活かせる経験を書いてください"
        className="min-h-48"
        {...register("motivation")}
      />

      <p className="text-xs leading-relaxed text-ink-sub">
        いいねすると、プロフィールと志望動機が企業に届きます。企業は7日以内に「気になる」か「見送り」を返します。送ったいいねは取り消せません。
      </p>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={like.isPending}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="accent"
          withShadow
          disabled={like.isPending}
        >
          {like.isPending ? "送信中…" : "いいねを送る"}
        </Button>
      </div>
    </form>
  );
}

type LikeTypeOptionProps = ComponentProps<"input"> & {
  value: "standard" | "super";
  quota: LikeQuotaItem;
  icon: ReactNode;
  title: string;
  description: string;
};

/** いいねの種類の選択肢(カード型のラジオボタン)。残りが0なら選べない */
function LikeTypeOption({
  value,
  quota,
  icon,
  title,
  description,
  ...props
}: LikeTypeOptionProps) {
  const disabled = quota.remaining === 0;

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-1 border-2 border-primary bg-white p-4 transition",
        "has-checked:bg-primary has-checked:text-white",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <input
        type="radio"
        value={value}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <span className="flex items-center gap-2 font-bold">
        {icon}
        {title}
      </span>
      <span className="text-xs opacity-80">{description}</span>
      <span className="font-display text-sm font-bold">
        残り {quota.remaining} / {quota.limit}
      </span>
    </label>
  );
}
