/**
 * ログイン後の戻り先(?redirect=)を、自サイト内のパスのときだけ使う。
 * 外部サイトへ移動させる偽のリンク(オープンリダイレクト)を防ぐため、それ以外は既定の移動先にする
 *
 * @example safeRedirectPath("/jobs/12", "/jobs") // "/jobs/12"
 * @example safeRedirectPath("//evil.example.com", "/jobs") // "/jobs"
 */
export function safeRedirectPath(
  redirect: string | null,
  fallback: string,
): string {
  // "//"や"/\"で始まるとブラウザは別のサイトとして扱うため、"/"の次の文字も確認する
  if (!redirect || !/^\/(?![/\\])/.test(redirect)) {
    return fallback;
  }

  return redirect;
}
