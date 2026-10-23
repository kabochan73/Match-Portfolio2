"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LikeStatusLabel } from "@/components/likes/LikeStatusLabel";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FormAlert } from "@/components/ui/FormAlert";
import { Pagination } from "@/components/ui/Pagination";
import { TabLinks } from "@/components/ui/TabLinks";
import type { LikeTab, SeekerLike } from "@/lib/api/types";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";
import { seekerLikesQueryOptions } from "@/lib/seeker/queries";
import { formatMonthDay } from "@/lib/utils/date";

const TABS: { value: LikeTab; label: string; empty: string }[] = [
  {
    value: "applied",
    label: "いいね済",
    empty: "企業の返事を待っている応募はありません。",
  },
  {
    value: "matched",
    label: "マッチ",
    empty: "マッチした求人はまだありません。",
  },
  {
    value: "unsuccessful",
    label: "不成立",
    empty: "不成立の応募はありません。",
  },
];

/** 応募状況のURL(タブ・ページをクエリに持たせる) */
function likesHref(status: LikeTab, page: number): string {
  const query = new URLSearchParams();

  if (status !== "applied") {
    query.set("status", status);
  }
  if (page > 1) {
    query.set("page", String(page));
  }

  const queryString = query.toString();

  return queryString ? `/likes?${queryString}` : "/likes";
}

/**
 * 応募状況(いいね済・マッチ・不成立のタブ)。タブ・ページをURLで持つため<Suspense>の中に置く
 */
export function SeekerLikesBoard() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const status =
    TABS.find((tab) => tab.value === statusParam)?.value ?? "applied";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data, isPending, isError } = useQuery(
    seekerLikesQueryOptions(status, page),
  );
  const currentTab = TABS.find((tab) => tab.value === status) ?? TABS[0];

  return (
    <div className="flex flex-col gap-5">
      <TabLinks
        label="応募の状況"
        tabs={TABS.map((tab) => ({
          href: likesHref(tab.value, 1),
          label: tab.label,
          count: data?.meta.counts[tab.value],
          isCurrent: tab.value === status,
        }))}
      />

      {isPending ? (
        <div className="h-64 animate-pulse border-2 border-primary/30 bg-white" />
      ) : isError ? (
        <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />
      ) : data.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center text-sm text-ink-sub">
          <p>{currentTab.empty}</p>
          <Link href="/jobs" className="font-bold text-primary underline">
            求人を探す
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col border-2 border-primary bg-white shadow-hard">
            {data.data.map((like) => (
              <SeekerLikeRow key={like.id} like={like} />
            ))}
          </ul>
          <Pagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            getHref={(nextPage) => likesHref(status, nextPage)}
          />
        </>
      )}
    </div>
  );
}

function SeekerLikeRow({ like }: { like: SeekerLike }) {
  const company = like.job_posting.company;

  return (
    <li className="border-b-2 border-tint last:border-b-0">
      <Link
        href={`/likes/${like.id}`}
        className="group flex gap-4 px-5 py-4 transition hover:bg-page"
      >
        {company && (
          <Avatar src={company.avatar_url} name={company.name} size={48} />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="truncate text-xs text-ink-sub">{company?.name}</p>
          <p className="font-bold text-ink group-hover:underline group-hover:underline-offset-4">
            {like.job_posting.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-sub">
            {like.like_type.value === "super" && (
              <Badge tone="accent">{like.like_type.label}</Badge>
            )}
            <LikeStatusLabel like={like} />
            <span>{formatMonthDay(like.created_at)}にいいね</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
