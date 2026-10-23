import { queryOptions } from "@tanstack/react-query";

import { apiClientFetch } from "@/lib/api/client";
import type { Masters, Wrapped } from "@/lib/api/types";

/**
 * 入力フォームの選択肢(職種・技術スタック・働き方・都道府県・雇用形態)をブラウザから取得する。
 * 運営しか変えないため、一度取得したら取り直さない
 */
export function mastersQueryOptions() {
  return queryOptions({
    queryKey: ["masters"],
    queryFn: async () => {
      const { data } = await apiClientFetch<Wrapped<Masters>>("/masters");

      return data;
    },
    staleTime: Infinity,
  });
}
