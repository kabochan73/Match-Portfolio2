import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { revalidateSecret } from "@/lib/api/config";

/**
 * 受け付けるタグ(求人一覧・求人1件・企業1社)。決まった形以外は、合言葉が合っていても受け付けない
 */
const ALLOWED_TAG = /^(jobs|job-[1-9]\d*|company-[1-9]\d*)$/;

/**
 * Laravelからの再検証の通知。求人・企業ページの編集やいいねで公開ページのデータが変わったとき、
 * 該当するタグのキャッシュを消し、次に開いた人から新しいデータで表示されるようにする。
 * 本文は { "tags": ["job-1", "company-2"] }、ヘッダーX-Revalidate-Secretに合言葉を付ける
 */
export async function POST(request: Request): Promise<Response> {
  if (!isValidSecret(request.headers.get("X-Revalidate-Secret"))) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tags = await readTags(request);

  if (!tags) {
    return Response.json({ message: "Invalid tags" }, { status: 422 });
  }

  // 通知の時点で古いデータを捨て、次に開いた人には必ず新しいデータを見せる
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: tags });
}

/** 合言葉を比べる(かかる時間から推測されないよう、長さが同じなら一定時間で比べる) */
function isValidSecret(received: string | null): boolean {
  if (!received) {
    return false;
  }

  const expected = Buffer.from(revalidateSecret());
  const actual = Buffer.from(received);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** 本文からタグを読む。形がおかしい・空・許可していないタグを含む場合はnull */
async function readTags(request: Request): Promise<string[] | null> {
  try {
    const body: unknown = await request.json();
    const tags =
      typeof body === "object" && body !== null && "tags" in body
        ? body.tags
        : null;

    if (
      !Array.isArray(tags) ||
      tags.length === 0 ||
      !tags.every((tag) => typeof tag === "string" && ALLOWED_TAG.test(tag))
    ) {
      return null;
    }

    return tags;
  } catch {
    return null;
  }
}
