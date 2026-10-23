"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AvatarInput } from "@/components/images/AvatarInput";
import { GalleryInput } from "@/components/images/GalleryInput";
import { Button, buttonClass } from "@/components/ui/Button";
import { describedBy, Field, FieldGroup } from "@/components/ui/Field";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { FormSuccess } from "@/components/ui/FormSuccess";
import { Select } from "@/components/ui/Select";
import { TagPicker } from "@/components/ui/TagPicker";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { apiClientFetch } from "@/lib/api/client";
import type { Company, Masters, Wrapped } from "@/lib/api/types";
import {
  type CompanyProfileFormValues,
  companyProfileSchema,
  PROFILE_TEXT_LIMITS,
  toCompanyProfileFormField,
  toCompanyProfileFormValues,
  toCompanyProfilePayload,
} from "@/lib/company/profileForm";
import {
  companyProfileQueryOptions,
  companyQueryKeys,
} from "@/lib/company/queries";
import {
  applyServerErrors,
  UNEXPECTED_ERROR_MESSAGE,
} from "@/lib/forms/applyServerErrors";
import { mastersQueryOptions } from "@/lib/masters/queries";

/** 企業ページの写真の上限(Laravelのバリデーションと合わせる) */
const MAX_COMPANY_IMAGES = 5;

const FIELDS = [
  "name",
  "introduction",
  "business_description",
  "culture",
  "founded_year",
  "member_count",
  "prefecture",
  "address_line",
  "website_url",
  "tech_stack_ids",
  "work_style_ids",
] as const;

/**
 * 企業ページの編集。保存済みの内容とマスタを取得してから、フォームを出す
 */
export function CompanyProfileEditor() {
  const { data: company, isError: isCompanyError } = useQuery(
    companyProfileQueryOptions(),
  );
  const { data: masters, isError: isMastersError } = useQuery(
    mastersQueryOptions(),
  );

  if (isCompanyError || isMastersError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  if (!company || !masters) {
    return (
      <div className="h-96 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  return <CompanyProfileForm company={company} masters={masters} />;
}

type CompanyProfileFormProps = {
  company: Company;
  masters: Masters;
};

function CompanyProfileForm({ company, masters }: CompanyProfileFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: toCompanyProfileFormValues(company),
  });

  // 文字数の表示用
  const [introduction, businessDescription, culture] = useWatch({
    control,
    name: ["introduction", "business_description", "culture"],
  });

  const save = useMutation({
    mutationFn: (values: CompanyProfileFormValues) =>
      apiClientFetch<Wrapped<Company>>("/company/profile", {
        method: "PUT",
        body: toCompanyProfilePayload(values),
      }),
    // 保存した内容を、取り直さずにそのまま使う
    onSuccess: ({ data }) =>
      queryClient.setQueryData(companyQueryKeys.profile, data),
    onError: (error) =>
      applyServerErrors(error, setError, FIELDS, toCompanyProfileFormField),
  });

  // 企業の所在地にリモートは選べない(リモートは求人の勤務地のための選択肢)
  const prefectures = masters.prefectures.filter(
    ({ value }) => value !== "remote",
  );

  // 画像はフォームとは別に、選んだ時点で保存する。保存したら企業ページの内容を取り直す
  const refetchProfile = () =>
    queryClient.invalidateQueries({ queryKey: companyQueryKeys.profile });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-body">
          求職者が見る企業ページの内容です。
        </p>
        <a
          href={`/companies/${company.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass({ variant: "secondary" })}
        >
          企業ページを見る
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>

      <FormSection title="ロゴ">
        <AvatarInput
          imageUrl={company.avatar_url}
          name={company.name}
          path="/company/avatar"
          label="ロゴ"
          onChanged={refetchProfile}
        />
      </FormSection>

      <FormSection title="写真ギャラリー">
        <GalleryInput
          images={company.images ?? []}
          max={MAX_COMPANY_IMAGES}
          uploadPath="/company/images"
          deletePathPrefix="/company/images"
          firstLabel="1枚目"
          onChanged={refetchProfile}
        />
      </FormSection>

      <form
        onSubmit={handleSubmit((values) => save.mutate(values))}
        noValidate
        className="flex flex-col gap-6"
      >
        <FormAlert message={errors.root?.message} />
        <FormSuccess
          message={
            save.isSuccess
              ? "保存しました。企業ページへの反映には最大5分ほどかかります。"
              : undefined
          }
        />

        <FormSection title="基本情報">
          <FormField
            label="会社名"
            autoComplete="organization"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextAreaField
            label="紹介文"
            id="introduction"
            limit={PROFILE_TEXT_LIMITS.introduction}
            length={introduction.length}
            error={errors.introduction?.message}
            className="min-h-24"
            placeholder="例: 中小企業の経理をなくすクラウドサービスを作っています"
            {...register("introduction")}
          />
        </FormSection>

        <FormSection title="事業内容・カルチャー">
          <TextAreaField
            label="事業内容"
            id="business_description"
            limit={PROFILE_TEXT_LIMITS.business_description}
            length={businessDescription.length}
            error={errors.business_description?.message}
            {...register("business_description")}
          />
          <TextAreaField
            label="カルチャー"
            id="culture"
            limit={PROFILE_TEXT_LIMITS.culture}
            length={culture.length}
            error={errors.culture?.message}
            placeholder="チーム構成・開発の進め方・レビュー文化など"
            {...register("culture")}
          />
        </FormSection>

        <FormSection title="技術スタック・働き方">
          <Controller
            control={control}
            name="tech_stack_ids"
            render={({ field }) => (
              <FieldGroup
                legend="技術スタック"
                name="tech_stack_ids"
                error={errors.tech_stack_ids?.message}
                hint="会社全体で使っている技術を選びます"
              >
                <TagPicker
                  name="tech_stack_ids"
                  items={masters.tech_stacks}
                  value={field.value}
                  onChange={field.onChange}
                  max={masters.tech_stacks.length}
                />
              </FieldGroup>
            )}
          />
          <Controller
            control={control}
            name="work_style_ids"
            render={({ field }) => (
              <FieldGroup
                legend="働き方"
                name="work_style_ids"
                error={errors.work_style_ids?.message}
              >
                <TagPicker
                  name="work_style_ids"
                  items={masters.work_styles}
                  value={field.value}
                  onChange={field.onChange}
                  max={masters.work_styles.length}
                />
              </FieldGroup>
            )}
          />
        </FormSection>

        <FormSection title="会社の基本データ">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="設立年"
              inputMode="numeric"
              placeholder="例: 2015"
              error={errors.founded_year?.message}
              {...register("founded_year")}
            />
            <FormField
              label="メンバー数(名)"
              inputMode="numeric"
              placeholder="例: 50"
              error={errors.member_count?.message}
              {...register("member_count")}
            />
            <Field
              label="所在地(都道府県)"
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
                {prefectures.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <FormField
              label="所在地(市区町村以下)"
              autoComplete="street-address"
              placeholder="例: 渋谷区渋谷1-2-3"
              error={errors.address_line?.message}
              {...register("address_line")}
            />
          </div>
          <FormField
            label="WebサイトURL"
            type="url"
            inputMode="url"
            placeholder="https://example.com"
            error={errors.website_url?.message}
            {...register("website_url")}
          />
        </FormSection>

        <div>
          <Button type="submit" size="lg" withShadow disabled={save.isPending}>
            {save.isPending ? "保存中…" : "保存する"}
          </Button>
        </div>
      </form>
    </div>
  );
}
