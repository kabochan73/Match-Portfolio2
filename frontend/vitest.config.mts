import { defineConfig } from "vitest/config";

/**
 * ロジック(lib/)のテスト。画面の部品は描画しないため、ブラウザの代わり(jsdom)は使わずNode.jsで動かす。
 * tsconfigPathsで、テストでも"@/lib/..."の書き方を使えるようにする
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
