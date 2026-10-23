"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { JobCard } from "@/components/jobs/JobCard";
import { Badge } from "@/components/ui/Badge";
import { FormAlert } from "@/components/ui/FormAlert";
import { Pagination } from "@/components/ui/Pagination";
import type { Bookmark } from "@/lib/api/types";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";
import { bookmarksQueryOptions } from "@/lib/seeker/queries";

/**
 * ブックマーク一覧。求人カードに、応募状況のバッジと募集終了の表示を重ねる。ページをURLで持つため<Suspense>の中に置く
 */
export function BookmarkList() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data, isPending, isError } = useQuery(bookmarksQueryOptions(page));

  if (isPending) {
    return (
      <div className="h-64 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  if (isError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center text-sm text-ink-sub">
        <p>
          ブックマークした求人はまだありません。気になる求人を保存しておけます。
        </p>
        <Link href="/jobs" className="font-bold text-primary underline">
          求人を探す
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid gap-6 sm:grid-cols-2">
        {data.data.map((bookmark) => (
          <li key={bookmark.id} className="flex flex-col gap-2">
            <BookmarkBadges bookmark={bookmark} />
            <JobCard job={bookmark.job_posting} />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={data.meta.current_page}
        lastPage={data.meta.last_page}
        getHref={(nextPage) =>
          nextPage > 1 ? `/bookmarks?page=${nextPage}` : "/bookmarks"
        }
      />
    </div>
  );
}

/** カードの上に出す、募集終了と応募状況のバッジ(どちらもなければ、高さをそろえるため空ける) */
function BookmarkBadges({ bookmark }: { bookmark: Bookmark }) {
  const like = bookmark.latest_like;
  // 期限切れ・見送りは、どちらも「不成立」として見せる
  const likeLabel =
    like === null
      ? null
      : like.status.value === "applied"
        ? "いいね済"
        : like.status.value === "matched"
          ? "マッチ"
          : "不成立";

  return (
    <div className="flex min-h-6 flex-wrap gap-2">
      {bookmark.job_posting_status.value === "closed" && (
        <Badge tone="muted">募集終了</Badge>
      )}
      {like && likeLabel && (
        <Link href={`/likes/${like.id}`}>
          <Badge tone={like.status.value === "matched" ? "primary" : "muted"}>
            {likeLabel}
          </Badge>
        </Link>
      )}
    </div>
  );
}
