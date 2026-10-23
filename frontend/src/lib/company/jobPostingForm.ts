import { z } from "zod";

import type { CompanyJobPosting } from "@/lib/api/types";

/** 職種・技術スタックの選べる数(Laravelのバリデーションと合わせる) */
export const MAX_JOB_CATEGORIES = 3;
export const MAX_TECH_STACKS = 5;
/** 選考フローのステップ数の上限 */
export const MAX_SELECTION_STEPS = 6;

/** 文字数の上限(Laravelのバリデーションと合わせ、入力欄の横に「12 / 100」と出す) */
export const TEXT_LIMITS = {
  title: 100,
  description: 5000,
  desired_candidate: 3000,
  selectionStep: 30,
} as const;

/**
 * 求人の作成・編集フォームの入力チェック。送る前に分かる入力漏れ・上限だけを見て、細かいルールはサーバーで確かめる。
 * 月給はフォームでは「万円」の文字列で持ち、送るときに円に変える
 */
export const jobPostingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "求人タイトルを入力してください")
    .max(TEXT_LIMITS.title, `${TEXT_LIMITS.title}文字以内で入力してください`),
  job_category_ids: z
    .array(z.number())
    .min(1, "職種を1つ以上選んでください")
    .max(MAX_JOB_CATEGORIES, `職種は${MAX_JOB_CATEGORIES}つまで選べます`),
  tech_stack_ids: z
    .array(z.number())
    .max(MAX_TECH_STACKS, `技術スタックは${MAX_TECH_STACKS}つまで選べます`),
  employment_type: z.string().min(1, "雇用形態を選んでください"),
  prefecture: z.string().min(1, "勤務地を選んでください"),
  salary_man: z
    .string()
    .min(1, "月給を入力してください")
    .refine(
      (value) =>
        /^\d+(\.\d)?$/.test(value) &&
        Number(value) >= 10 &&
        Number(value) <= 200,
      "月給は10〜200(万円)の数値で入力してください(小数は1桁まで)",
    ),
  description: z
    .string()
    .trim()
    .min(1, "仕事内容を入力してください")
    .max(
      TEXT_LIMITS.description,
      `${TEXT_LIMITS.description}文字以内で入力してください`,
    ),
  desired_candidate: z
    .string()
    .trim()
    .min(1, "求める人材を入力してください")
    .max(
      TEXT_LIMITS.desired_candidate,
      `${TEXT_LIMITS.desired_candidate}文字以内で入力してください`,
    ),
  selection_steps: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "ステップ名を入力してください")
          .max(
            TEXT_LIMITS.selectionStep,
            `${TEXT_LIMITS.selectionStep}文字以内で入力してください`,
          ),
      }),
    )
    .min(1, "選考フローを1ステップ以上入力してください")
    .max(
      MAX_SELECTION_STEPS,
      `選考フローは${MAX_SELECTION_STEPS}ステップまでです`,
    ),
});

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

/** 新しく作るときの初期値 */
export const emptyJobPostingValues: JobPostingFormValues = {
  title: "",
  job_category_ids: [],
  tech_stack_ids: [],
  employment_type: "",
  prefecture: "",
  salary_man: "",
  description: "",
  desired_candidate: "",
  selection_steps: [{ name: "カジュアル面談" }, { name: "面接" }],
};

/** 編集するときの初期値(保存済みの求人から作る) */
export function toJobPostingFormValues(
  jobPosting: CompanyJobPosting,
): JobPostingFormValues {
  return {
    title: jobPosting.title,
    job_category_ids: jobPosting.job_categories.map(({ id }) => id),
    tech_stack_ids: (jobPosting.tech_stacks ?? []).map(({ id }) => id),
    employment_type: jobPosting.employment_type.value,
    prefecture: jobPosting.prefecture.value,
    salary_man: String(jobPosting.salary / 10000),
    description: jobPosting.description,
    desired_candidate: jobPosting.desired_candidate,
    selection_steps: jobPosting.selection_steps.map((name) => ({ name })),
  };
}

/** APIに送る形(月給は円、選考フローは文字列の配列) */
export function toJobPostingPayload(values: JobPostingFormValues) {
  const { salary_man: salaryMan, selection_steps: steps, ...rest } = values;

  return {
    ...rest,
    salary: Math.round(Number(salaryMan) * 10000),
    selection_steps: steps.map(({ name }) => name),
  };
}

/**
 * サーバーの項目名をフォームの項目名に読み替える
 * (例: "selection_steps.1" → "selection_steps.1.name"、"job_category_ids.0" → "job_category_ids")
 */
export function toJobPostingFormField(serverField: string): string {
  if (serverField === "salary") {
    return "salary_man";
  }

  const [field, index] = serverField.split(".");

  if (field === "selection_steps" && index !== undefined) {
    return `selection_steps.${index}.name`;
  }

  return field;
}
