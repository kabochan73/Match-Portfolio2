import { environmentManager, QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // サーバーで取得したデータを、ブラウザに渡した直後に取り直さないようにする
        staleTime: 60 * 1000,
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
