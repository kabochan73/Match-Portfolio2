"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button, buttonClass } from "@/components/ui/Button";
import { describedBy, Field, FieldGroup } from "@/components/ui/Field";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { Select } from "@/components/ui/Select";
import { TagPicker } from "@/components/ui/TagPicker";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { apiClientFetch } from "@/lib/api/client";
import type { CompanyJobPosting, Wrapped } from "@/lib/api/types";
import {
  emptyJobPostingValues,
  type JobPostingFormValues,
  jobPostingSchema,
  MAX_JOB_CATEGORIES,
  MAX_TECH_STACKS,
  TEXT_LIMITS,
  toJobPostingFormField,
  toJobPostingFormValues,
  toJobPostingPayload,
} from "@/lib/company/jobPostingForm";
import { companyQueryKeys } from "@/lib/company/queries";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import { mastersQueryOptions } from "@/lib/masters/queries";

import { SelectionStepsInput } from "./SelectionStepsInput";

const FIELDS = [
  "title",
  "job_category_ids",
  "tech_stack_ids",
  "employment_type",
  "prefecture",
  "salary_man",
  "description",
  "desired_candidate",
  "selection_steps",
] as const;

type JobPostingFormProps = {
  /** 編集する求人。なければ新しく作る(下書きとして保存する) */
  jobPosting?: CompanyJobPosting;
};

/**
 * 求人の作成・編集フォーム。保存したら、その求人の詳細(管理)へ移動する
 */
export function JobPostingForm({ jobPosting }: JobPostingFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: masters } = useQuery(mastersQueryOptions());

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: jobPosting
      ? toJobPostingFormValues(jobPosting)
      : emptyJobPostingValues,
  });

  // 文字数の表示用(入力のたびに数え直す)
  const description = useWatch({ control, name: "description" });
  const desiredCandidate = useWatch({ control, name: "desired_candidate" });

  const save = useMutation({
    mutationFn: (values: JobPostingFormValues) =>
      apiClientFetch<Wrapped<CompanyJobPosting>>(
        jobPosting
          ? `/company/job-postings/${jobPosting.id}`
          : "/company/job-postings",
        {
          method: jobPosting ? "PUT" : "POST",
          body: toJobPostingPayload(values),
        },
      ),
    onSuccess: async ({ data }) => {
      // 一覧と、この求人の詳細を取り直す
      await queryClient.invalidateQueries({
        queryKey: companyQueryKeys.jobPostings,
      });
      router.push(`/company/job-postings/${data.id}`);
    },
    onError: (error) =>
      applyServerErrors(error, setError, FIELDS, toJobPostingFormField),
  });

  if (!masters) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit((values) => save.mutate(values))}
      noValidate
      className="flex flex-col gap-6"
    >
      <FormAlert message={errors.root?.message} />

      <FormSection title="基本情報">
        <FormField
          label="求人タイトル"
          placeholder="例: 自社SaaSを開発するバックエンドエンジニア"
          error={errors.title?.message}
          hint="求人カードに表示されます"
          {...register("title")}
        />
        <Controller
          control={control}
          name="job_category_ids"
          render={({ field }) => (
            <FieldGroup
              legend="職種"
              name="job_category_ids"
              error={errors.job_category_ids?.message}
              hint="兼務のポジションなら、複数選べます"
              aside={
                <Count value={field.value.length} max={MAX_JOB_CATEGORIES} />
              }
            >
              <TagPicker
                name="job_category_ids"
                items={masters.job_categories}
                value={field.value}
                onChange={field.onChange}
                max={MAX_JOB_CATEGORIES}
              />
            </FieldGroup>
          )}
        />
        <Controller
          control={control}
          name="tech_stack_ids"
          render={({ field }) => (
            <FieldGroup
              legend="技術スタック"
              name="tech_stack_ids"
              error={errors.tech_stack_ids?.message}
              hint="このポジションで主に使う技術を選びます"
              aside={<Count value={field.value.length} max={MAX_TECH_STACKS} />}
            >
              <TagPicker
                name="tech_stack_ids"
                items={masters.tech_stacks}
                value={field.value}
                onChange={field.onChange}
                max={MAX_TECH_STACKS}
              />
            </FieldGroup>
          )}
        />
      </FormSection>

      <FormSection title="条件">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="雇用形態"
            htmlFor="employment_type"
            error={errors.employment_type?.message}
          >
            <Select
              id="employment_type"
              aria-invalid={errors.employment_type ? true : undefined}
              aria-describedby={describedBy(
                "employment_type",
                errors.employment_type?.message,
              )}
              {...register("employment_type")}
            >
              <option value="">選んでください</option>
              {masters.employment_types.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="勤務地"
            htmlFor="prefecture"
            error={errors.prefecture?.message}
          >
            <Select
              id="prefecture"
              aria-invalid={errors.prefecture ? true : undefined}
              aria-describedby={describedBy(
                "prefecture",
                errors.prefecture?.message,
              )}
              {...register("prefecture")}
            >
              <option value="">選んでください</option>
              {masters.prefectures.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <FormField
            label="月給(万円)"
            type="text"
            inputMode="decimal"
            placeholder="例: 45"
            hint="10〜200万円"
            error={errors.salary_man?.message}
            {...register("salary_man")}
          />
        </div>
      </FormSection>

      <FormSection title="仕事内容・求める人材">
        <TextAreaField
          label="仕事内容"
          id="description"
          limit={TEXT_LIMITS.description}
          length={description.length}
          error={errors.description?.message}
          {...register("description")}
        />
        <TextAreaField
          label="求める人材"
          id="desired_candidate"
          limit={TEXT_LIMITS.desired_candidate}
          length={desiredCandidate.length}
          error={errors.desired_candidate?.message}
          {...register("desired_candidate")}
        />
      </FormSection>

      <FormSection title="選考フロー">
        <SelectionStepsInput
          control={control}
          register={register}
          errors={errors}
        />
      </FormSection>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" withShadow disabled={save.isPending}>
          {save.isPending
            ? "保存中…"
            : jobPosting
              ? "変更を保存"
              : "下書きとして保存"}
        </Button>
        <Link
          href={
            jobPosting
              ? `/company/job-postings/${jobPosting.id}`
              : "/company/job-postings"
          }
          className={buttonClass({ variant: "secondary", size: "lg" })}
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}

/** 選んだ数と上限(「2 / 3」) */
function Count({ value, max }: { value: number; max: number }) {
  return (
    <span className="font-display text-xs text-ink-sub">
      {value} / {max}
    </span>
  );
}
