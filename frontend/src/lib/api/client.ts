import { ApiError, ValidationError, type ValidationErrors } from "./errors";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiClientOptions = {
  method?: HttpMethod;
  /** JSONにして送る値(FormDataならそのまま送る) */
  body?: unknown;
};

const XSRF_COOKIE = "XSRF-TOKEN";

/**
 * ブラウザから使うAPI呼び出し。同じドメインの/apiを呼び、Next.jsのrewritesでLaravelへ中継される。
 * 送信系(GET以外)はCSRF対策のトークンを付ける
 *
 * @param path "/seeker/login"のような/api以降のパス
 * @throws ValidationError 入力エラー(422)のとき
 * @throws ApiError それ以外のエラーのとき
 */
export async function apiClientFetch<T>(
  path: string,
  { method = "GET", body }: ApiClientOptions = {},
): Promise<T> {
  const isMutation = method !== "GET";

  if (isMutation && !readCookie(XSRF_COOKIE)) {
    await refreshCsrfCookie();
  }

  let response = await send(path, method, body);

  // CSRFのCookieが残っていても、セッション切れやDBの作り直しで無効になっていると419になる。
  // Cookieを取り直して1回だけやり直す(Cookieの有無だけで判断すると、無効なトークンを送り続けてしまうため)
  if (isMutation && response.status === 419) {
    await refreshCsrfCookie();
    response = await send(path, method, body);
  }

  if (response.status === 422) {
    const data = (await response.json()) as {
      message: string;
      errors: ValidationErrors;
    };
    throw new ValidationError(data.message, data.errors);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `APIの呼び出しに失敗しました(${response.status} ${path})`,
    );
  }

  // ログアウトなどは本文なし(204)で返る
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function send(
  path: string,
  method: HttpMethod,
  body: unknown,
): Promise<Response> {
  const xsrfToken = readCookie(XSRF_COOKIE);
  // 画像などのファイルはFormDataのまま送る(Content-Typeは区切り文字付きでブラウザが付ける)
  const isFormData = body instanceof FormData;

  return fetch(`/api${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined &&
        !isFormData && { "Content-Type": "application/json" }),
      ...(xsrfToken && { "X-XSRF-TOKEN": xsrfToken }),
    },
    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });
}

/** CSRF対策のトークン(XSRF-TOKEN Cookie)をLaravelから受け取る */
async function refreshCsrfCookie(): Promise<void> {
  await fetch("/sanctum/csrf-cookie", {
    headers: { Accept: "application/json" },
  });
}

function readCookie(name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  // LaravelはURLエンコードした値を入れるため、ヘッダーに付ける前に戻す
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}
