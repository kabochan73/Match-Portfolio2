import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { ApiError } from "@/lib/api/errors";
import { apiPublicFetch } from "@/lib/api/server";
import type {
  JobPostingDetail,
  JobPostingSummary,
  Masters,
  Paginated,
  Wrapped,
} from "@/lib/api/types";

/** いいね数・人気順の反映を最大5分遅らせて、キャッシュを効かせる */
const LIKE_COUNT_REVALIDATE_SECONDS = 300;

export type JobSearchParams = {
  jobCategoryIds?: number[];
  techStackIds?: number[];
  prefecture?: string;
  employmentTypes?: string[];
  keyword?: string;
  sort?: "new" | "popular";
  page?: number;
};

/**
 * 検索・入力フォームの選択肢(職種・技術スタック・働き方・都道府県・雇用形態)。ほぼ変わらないため長くキャッシュする
 */
export async function getMasters(): Promise<Masters> {
  "use cache";
  cacheLife("days");
  cacheTag("masters");

  const { data } = await apiPublicFetch<Wrapped<Masters>>("/masters");

  return data;
}

/**
 * 公開中の求人を検索する。検索条件ごとにキャッシュされる
 */
export async function searchJobs(
  params: JobSearchParams,
): Promise<Paginated<JobPostingSummary>> {
  // 同じ条件なら同じキャッシュを使えるよう、条件を決まった並びの文字列にしてから渡す
  return fetchJobs(toQueryString(params));
}

async function fetchJobs(
  queryString: string,
): Promise<Paginated<JobPostingSummary>> {
  "use cache";
  cacheLife({ revalidate: LIKE_COUNT_REVALIDATE_SECONDS });
  cacheTag("jobs");

  return apiPublicFetch<Paginated<JobPostingSummary>>(`/jobs?${queryString}`);
}

/**
 * 求人の詳細(公開中・募集終了)。見つからない(下書き・存在しない)場合はnull
 */
export async function getJob(id: number): Promise<JobPostingDetail | null> {
  "use cache";
  cacheLife({ revalidate: LIKE_COUNT_REVALIDATE_SECONDS });
  // 求人ごとのタグで、企業が編集したときにこの求人だけを再検証できるようにする
  cacheTag(`job-${id}`, "jobs");

  try {
    const { data } = await apiPublicFetch<Wrapped<JobPostingDetail>>(
      `/jobs/${id}`,
    );

    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

/**
 * 検索条件をLaravelが読める形(配列はkey[]=1&key[]=2)のクエリ文字列にする。
 * 配列は並べ替え、空の条件は省き、同じ条件なら必ず同じ文字列になるようにする
 */
function toQueryString(params: JobSearchParams): string {
  const query = new URLSearchParams();

  [...(params.jobCategoryIds ?? [])]
    .sort((a, b) => a - b)
    .forEach((id) => query.append("job_category_ids[]", String(id)));
  [...(params.techStackIds ?? [])]
    .sort((a, b) => a - b)
    .forEach((id) => query.append("tech_stack_ids[]", String(id)));
  [...(params.employmentTypes ?? [])]
    .sort()
    .forEach((type) => query.append("employment_types[]", type));

  if (params.prefecture) {
    query.set("prefecture", params.prefecture);
  }

  const keyword = params.keyword?.trim();
  if (keyword) {
    query.set("keyword", keyword);
  }

  if (params.sort && params.sort !== "new") {
    query.set("sort", params.sort);
  }

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  return query.toString();
}
