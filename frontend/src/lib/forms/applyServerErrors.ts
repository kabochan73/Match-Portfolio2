import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError, ValidationError } from "@/lib/api/errors";

/** 項目に結び付けられないエラー(通信の失敗など)のメッセージ */
export const UNEXPECTED_ERROR_MESSAGE =
  "通信に失敗しました。時間をおいてもう一度お試しください。";

/** 回数制限(429。ログイン・会員登録・パスワード再設定を短い間に繰り返したとき)のメッセージ */
export const TOO_MANY_REQUESTS_MESSAGE =
  "試行回数が多すぎます。しばらくしてからもう一度お試しください。";

/**
 * 送信時のエラーをフォームに反映する。
 * 入力エラー(422)は該当する項目の下に、それ以外はフォーム全体のエラー(root)として表示する
 *
 * @param fields フォームにある項目名。サーバーが返した項目名がこれに含まれないときは、フォーム全体のエラーにする
 * @param toFormField サーバーとフォームで項目名が違うときの読み替え(配列の要素のエラー"selection_steps.1"など)
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  toFormField: (serverField: string) => string = (serverField) => serverField,
): void {
  if (!(error instanceof ValidationError)) {
    setError("root", { message: errorMessage(error) });
    return;
  }

  for (const [serverField, messages] of Object.entries(error.errors)) {
    const field = toFormField(serverField);
    const message = messages[0];

    if ((fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { message });
    } else {
      setError("root", { message });
    }
  }
}

/**
 * エラーを、画面に出す1つの文にする(フォーム以外の操作や、フォーム全体のエラーで使う)。
 * 入力エラー(422)なら最初のメッセージ、回数制限(429)ならその案内、それ以外は通信の失敗の文
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return Object.values(error.errors)[0]?.[0] ?? error.message;
  }

  if (error instanceof ApiError && error.status === 429) {
    return TOO_MANY_REQUESTS_MESSAGE;
  }

  return UNEXPECTED_ERROR_MESSAGE;
}
