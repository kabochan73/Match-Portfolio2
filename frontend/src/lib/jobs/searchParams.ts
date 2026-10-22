import type { Masters } from "@/lib/api/types";
import type { JobSearchParams } from "@/lib/jobs/api";

/**
 * 求人一覧のURLのクエリ名。検索フォームの各入力欄のnameにも使う
 *
 * @example /jobs?category=1&tech=3&tech=15&location=tokyo&type=full_time&q=SaaS&sort=popular
 */
export const JOB_SEARCH_QUERY = {
  jobCategory: "category",
  techStack: "tech",
  location: "location",
  employmentType: "type",
  keyword: "q",
  sort: "sort",
  page: "page",
} as const;

/** キーワードの最大文字数(LaravelのJobSearchRequestと合わせる) */
export const KEYWORD_MAX_LENGTH = 100;

/** page.tsxのsearchParamsの形 */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * URLのクエリを検索条件にする。
 * 手入力や古いリンクで存在しない値が来ても検索がエラーにならないよう、マスタにない値は捨てる
 */
export function parseJobSearchParams(
  raw: RawSearchParams,
  masters: Masters,
): JobSearchParams {
  const jobCategoryIds = new Set(masters.job_categories.map(({ id }) => id));
  const techStackIds = new Set(masters.tech_stacks.map(({ id }) => id));
  const prefectures = new Set(masters.prefectures.map(({ value }) => value));
  const employmentTypes = new Set(
    masters.employment_types.map(({ value }) => value),
  );

  const location = first(raw[JOB_SEARCH_QUERY.location]);
  const keyword = first(raw[JOB_SEARCH_QUERY.keyword])
    ?.trim()
    .slice(0, KEYWORD_MAX_LENGTH);

  return {
    jobCategoryIds: toIds(raw[JOB_SEARCH_QUERY.jobCategory]).filter((id) =>
      jobCategoryIds.has(id),
    ),
    techStackIds: toIds(raw[JOB_SEARCH_QUERY.techStack]).filter((id) =>
      techStackIds.has(id),
    ),
    prefecture: location && prefectures.has(location) ? location : undefined,
    employmentTypes: unique(
      toArray(raw[JOB_SEARCH_QUERY.employmentType]),
    ).filter((type) => employmentTypes.has(type)),
    keyword: keyword || undefined,
    sort: first(raw[JOB_SEARCH_QUERY.sort]) === "popular" ? "popular" : "new",
    page: toIds(raw[JOB_SEARCH_QUERY.page])[0] ?? 1,
  };
}

/**
 * 検索条件から求人一覧のURLを作る(並び替えのリンクなど、条件の一部だけを変えたいときに使う)
 *
 * @example jobsHref({ ...params, sort: "popular" })
 */
export function jobsHref(params: JobSearchParams): string {
  const query = new URLSearchParams();

  params.jobCategoryIds?.forEach((id) =>
    query.append(JOB_SEARCH_QUERY.jobCategory, String(id)),
  );
  params.techStackIds?.forEach((id) =>
    query.append(JOB_SEARCH_QUERY.techStack, String(id)),
  );
  if (params.prefecture) {
    query.set(JOB_SEARCH_QUERY.location, params.prefecture);
  }
  params.employmentTypes?.forEach((type) =>
    query.append(JOB_SEARCH_QUERY.employmentType, type),
  );
  if (params.keyword) {
    query.set(JOB_SEARCH_QUERY.keyword, params.keyword);
  }
  if (params.sort === "popular") {
    query.set(JOB_SEARCH_QUERY.sort, "popular");
  }
  if (params.page && params.page > 1) {
    query.set(JOB_SEARCH_QUERY.page, String(params.page));
  }

  const queryString = query.toString();

  return queryString ? `/jobs?${queryString}` : "/jobs";
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function first(value: string | string[] | undefined): string | undefined {
  return toArray(value)[0];
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/** 正の整数だけを取り出す("abc"や"1.5"は捨てる) */
function toIds(value: string | string[] | undefined): number[] {
  return unique(
    toArray(value)
      .filter((v) => /^[1-9]\d*$/.test(v))
      .map(Number),
  );
}
