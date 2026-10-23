import Link from "next/link";

import { ApiError } from "@/lib/api/errors";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";

import { buttonClass } from "./Button";
import { FormAlert } from "./FormAlert";

type QueryErrorNoticeProps = {
  error: unknown;
  /** 見つからない(404)・自分のものではない(403)ときの文 */
  notFoundMessage: string;
  /** 戻り先(一覧など) */
  backHref: string;
  backLabel: string;
};

/**
 * 取得に失敗したときの表示。他社・他人のもの(403)や存在しないもの(404)は「見つからない」と伝え、戻り先を出す。
 * それ以外(通信の失敗など)は、通信に失敗したことを伝える
 */
export function QueryErrorNotice({
  error,
  notFoundMessage,
  backHref,
  backLabel,
}: QueryErrorNoticeProps) {
  const notFound =
    error instanceof ApiError && (error.status === 403 || error.status === 404);

  if (!notFound) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  return (
    <div className="flex flex-col items-center gap-5 border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center">
      <p className="text-sm text-ink-body">{notFoundMessage}</p>
      <Link href={backHref} className={buttonClass({ variant: "secondary" })}>
        {backLabel}
      </Link>
    </div>
  );
}
