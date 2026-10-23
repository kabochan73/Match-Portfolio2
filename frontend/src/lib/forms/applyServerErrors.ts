import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ValidationError } from "@/lib/api/errors";

/** 項目に結び付けられないエラー(通信の失敗など)のメッセージ */
export const UNEXPECTED_ERROR_MESSAGE =
  "通信に失敗しました。時間をおいてもう一度お試しください。";

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
    setError("root", { message: UNEXPECTED_ERROR_MESSAGE });
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
 * フォーム以外の操作(公開・削除など)のエラーを、画面に出す1つの文にする。
 * 入力エラー(422)なら最初のメッセージ、それ以外は通信の失敗の文
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return Object.values(error.errors)[0]?.[0] ?? error.message;
  }

  return UNEXPECTED_ERROR_MESSAGE;
}
