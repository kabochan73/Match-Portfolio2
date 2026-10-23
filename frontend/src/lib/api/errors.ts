/**
 * APIがエラー(2xx以外)を返したときの例外。画面側でステータスを見て出し分ける(404ならnotFound()等)。
 * ブラウザ用(client.ts)とサーバー用(server.ts)で共通
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Laravelの入力エラー(422)の項目ごとのメッセージ。{ email: ["メールアドレスは必須項目です。"] } */
export type ValidationErrors = Record<string, string[]>;

/**
 * 入力エラー(422)。フォームでは項目ごとのメッセージを、その項目の下に表示する
 */
export class ValidationError extends ApiError {
  constructor(
    message: string,
    public readonly errors: ValidationErrors,
  ) {
    super(422, message);
    this.name = "ValidationError";
  }
}
