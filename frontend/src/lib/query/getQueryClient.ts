import { environmentManager, QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";

/** 取得に失敗したときにやり直す回数 */
const MAX_RETRIES = 3;

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // サーバーで取得したデータを、ブラウザに渡した直後に取り直さないようにする
        staleTime: 60 * 1000,
        // 見つからない(404)・権限がない(403)など、やり直しても結果が変わらないエラー(4xx)はすぐに失敗にする。
        // 通信の失敗やサーバーのエラー(5xx)だけをやり直す
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) &&
          failureCount < MAX_RETRIES,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * TanStack QueryのQueryClient(公式のNext.js App Routerの構成)。
 * サーバーではリクエストごとに新しく作り(他の人のデータが混ざらないように)、ブラウザでは1つを使い回す
 */
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }

  // Reactが描画の途中で中断しても作り直さないよう、ブラウザでは1つだけ作る
  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
}
