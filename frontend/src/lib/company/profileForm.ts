import { z } from "zod";

import type { Company } from "@/lib/api/types";

/** 文字数の上限(Laravelのバリデーションと合わせ、入力欄の横に「12 / 200」と出す) */
export const PROFILE_TEXT_LIMITS = {
  name: 255,
  introduction: 200,
  business_description: 2000,
  culture: 2000,
  address_line: 255,
} as const;

/** メンバー数の上限(Laravelのバリデーションと合わせる) */
const MAX_MEMBER_COUNT = 1_000_000;

/** 任意の文字列(空なら未入力として送る) */
function optionalText(max: number) {
  return z.string().trim().max(max, `${max}文字以内で入力してください`);
}

/**
 * 企業ページの編集フォームの入力チェック。会社名以外は任意。
 * 数値の項目もフォームでは文字列で持ち、空なら未入力(null)として送る
 */
export const companyProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "会社名を入力してください")
    .max(
      PROFILE_TEXT_LIMITS.name,
      `${PROFILE_TEXT_LIMITS.name}文字以内で入力してください`,
    ),
  introduction: optionalText(PROFILE_TEXT_LIMITS.introduction),
  business_description: optionalText(PROFILE_TEXT_LIMITS.business_description),
  culture: optionalText(PROFILE_TEXT_LIMITS.culture),
  founded_year: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d{4}$/.test(value) &&
          Number(value) >= 1800 &&
          Number(value) <= new Date().getFullYear()),
      "設立年は4桁の西暦で入力してください(例: 2015)",
    ),
  member_count: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) &&
          Number(value) >= 1 &&
          Number(value) <= MAX_MEMBER_COUNT),
      "メンバー数は1以上の整数で入力してください",
    ),
  prefecture: z.string(),
  address_line: optionalText(PROFILE_TEXT_LIMITS.address_line),
  website_url: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\/\S+$/.test(value),
      "http://またはhttps://から始まるURLを入力してください",
    ),
  tech_stack_ids: z.array(z.number()),
  work_style_ids: z.array(z.number()),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

/** 保存済みの企業ページから、フォームの初期値を作る(未入力の項目は空文字) */
export function toCompanyProfileFormValues(
  company: Company,
): CompanyProfileFormValues {
  return {
    name: company.name,
    introduction: company.introduction ?? "",
    business_description: company.business_description ?? "",
    culture: company.culture ?? "",
    founded_year: company.founded_year?.toString() ?? "",
    member_count: company.member_count?.toString() ?? "",
    prefecture: company.prefecture?.value ?? "",
    address_line: company.address_line ?? "",
    website_url: company.website_url ?? "",
    tech_stack_ids: (company.tech_stacks ?? []).map(({ id }) => id),
    work_style_ids: (company.work_styles ?? []).map(({ id }) => id),
  };
}

/** APIに送る形(空の項目はnull、数値の項目は数値にする) */
export function toCompanyProfilePayload(values: CompanyProfileFormValues) {
  const orNull = (value: string) => (value === "" ? null : value);

  return {
    name: values.name,
    introduction: orNull(values.introduction),
    business_description: orNull(values.business_description),
    culture: orNull(values.culture),
    founded_year:
      values.founded_year === "" ? null : Number(values.founded_year),
    member_count:
      values.member_count === "" ? null : Number(values.member_count),
    prefecture: orNull(values.prefecture),
    address_line: orNull(values.address_line),
    website_url: orNull(values.website_url),
    tech_stack_ids: values.tech_stack_ids,
    work_style_ids: values.work_style_ids,
  };
}

/** サーバーの項目名をフォームの項目名に読み替える("tech_stack_ids.0" → "tech_stack_ids") */
export function toCompanyProfileFormField(serverField: string): string {
  return serverField.split(".")[0];
}
