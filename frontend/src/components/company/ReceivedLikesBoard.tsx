"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FormAlert } from "@/components/ui/FormAlert";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { TabLinks } from "@/components/ui/TabLinks";
import type { LikeTab, ReceivedLike } from "@/lib/api/types";
import {
  companyJobPostingsQueryOptions,
  receivedLikesQueryOptions,
  type ReceivedLikesFilter,
} from "@/lib/company/queries";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";

import { LikeStatusLabel } from "./LikeStatusLabel";

const TABS: { value: LikeTab; label: string; empty: string }[] = [
  {
    value: "applied",
    label: "反応待ち",
    empty: "返事を待っている応募はありません。",
  },
  {
    value: "matched",
    label: "マッチ",
    empty: "マッチした応募者はまだいません。",
  },
  {
    value: "unsuccessful",
    label: "不成立",
    empty: "不成立の応募はありません。",
  },
];

/** 応募者一覧のURL(タブ・求人・ページをクエリに持たせる) */
function likesHref({
  status,
  jobPostingId,
  page,
}: ReceivedLikesFilter): string {
  const query = new URLSearchParams();

  if (status !== "applied") {
    query.set("status", status);
  }
  if (jobPostingId) {
    query.set("job_posting_id", String(jobPostingId));
  }
  if (page > 1) {
    query.set("page", String(page));
  }

  const queryString = query.toString();

  return queryString ? `/company/likes?${queryString}` : "/company/likes";
}

/** URLのクエリを絞り込みの条件にする(おかしな値は既定に戻す) */
function parseFilter(searchParams: URLSearchParams): ReceivedLikesFilter {
  const status = searchParams.get("status");
  const jobPostingId = Number(searchParams.get("job_posting_id"));
  const page = Number(searchParams.get("page"));

  return {
    status: TABS.some((tab) => tab.value === status)
      ? (status as LikeTab)
      : "applied",
    jobPostingId:
      Number.isInteger(jobPostingId) && jobPostingId > 0 ? jobPostingId : null,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/**
 * 応募者一覧。タブ(反応待ち・マッチ・不成立)・求人の絞り込み・ページをURLで持つ。
 * URLを読むため<Suspense>の中に置く
 */
export function ReceivedLikesBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams);
  const { data, isPending, isError } = useQuery(
    receivedLikesQueryOptions(filter),
  );
  const { data: jobPostings } = useQuery(companyJobPostingsQueryOptions());

  const currentTab = TABS.find((tab) => tab.value === filter.status) ?? TABS[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TabLinks
          label="応募の状況"
          tabs={TABS.map((tab) => ({
            href: likesHref({ ...filter, status: tab.value, page: 1 }),
            label: tab.label,
            count: data?.meta.counts[tab.value],
            isCurrent: tab.value === filter.status,
          }))}
        />
        <div className="w-full sm:w-72">
          <label htmlFor="job-posting-filter" className="sr-only">
            求人で絞り込む
          </label>
          <Select
            id="job-posting-filter"
            value={filter.jobPostingId ?? ""}
            onChange={(event) =>
              router.push(
                likesHref({
                  ...filter,
                  jobPostingId: Number(event.target.value) || null,
                  page: 1,
                }),
                { scroll: false },
              )
            }
          >
            <option value="">すべての求人</option>
            {jobPostings?.data.map((jobPosting) => (
              <option key={jobPosting.id} value={jobPosting.id}>
                {jobPosting.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isPending ? (
        <div className="h-64 animate-pulse border-2 border-primary/30 bg-white" />
      ) : isError ? (
        <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />
      ) : data.data.length === 0 ? (
        <p className="border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center text-sm text-ink-sub">
          {currentTab.empty}
        </p>
      ) : (
        <>
          <ul className="flex flex-col border-2 border-primary bg-white shadow-hard">
            {data.data.map((like) => (
              <ReceivedLikeRow key={like.id} like={like} />
            ))}
          </ul>
          <Pagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            getHref={(page) => likesHref({ ...filter, page })}
          />
        </>
      )}
    </div>
  );
}

function ReceivedLikeRow({ like }: { like: ReceivedLike }) {
  return (
    <li className="border-b-2 border-tint last:border-b-0">
      <Link
        href={`/company/likes/${like.id}`}
        className="group flex gap-4 px-5 py-4 transition hover:bg-page"
      >
        <Avatar
          src={like.applicant.avatar_url}
          name={like.applicant.name}
          size={48}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-bold text-ink group-hover:underline group-hover:underline-offset-4">
              {like.applicant.name}
              <span className="ml-1 text-sm font-normal text-ink-sub">
                ({like.applicant.age})
              </span>
            </p>
            {/* スーパーいいねは、強い熱意の印として目立たせる */}
            {like.like_type.value === "super" && (
              <Badge tone="accent">{like.like_type.label}</Badge>
            )}
            <LikeStatusLabel like={like} />
          </div>
          <p className="truncate text-xs text-ink-sub">
            {like.job_posting.title}
          </p>
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-body">
            {like.motivation}
          </p>
        </div>
      </Link>
    </li>
  );
}
