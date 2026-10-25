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

/**
 * 求人一覧の作り直しの間隔。検索条件ごとにキャッシュがあるため、いいねのたびには作り直さず、
 * いいね数・人気順の反映を最大5分遅らせる(公開・募集終了・削除のときは、Laravelからの通知ですぐ作り直す)
 */
const JOB_LIST_REVALIDATE_SECONDS = 300;

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
  cacheLife({ revalidate: JOB_LIST_REVALIDATE_SECONDS });
  cacheTag("jobs");

  return apiPublicFetch<Paginated<JobPostingSummary>>(`/jobs?${queryString}`);
}

/**
 * 求人の詳細(公開中・募集終了)。見つからない(下書き・存在しない)場合はnull。
 * 求人の変更・いいねのときにLaravelから通知が届き、job-{id}のタグで作り直す。
 * 会社カードも含むため、企業ページの編集でも作り直せるようcompany-{id}のタグも付ける。
 * 通知が届かなかったときの保険として、1日たったら作り直す
 */
export async function getJob(id: number): Promise<JobPostingDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`job-${id}`);

  try {
    const { data } = await apiPublicFetch<Wrapped<JobPostingDetail>>(
      `/jobs/${id}`,
    );
    cacheTag(`company-${data.company.id}`);

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
