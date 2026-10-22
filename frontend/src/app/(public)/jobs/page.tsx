import Link from "next/link";
import { Suspense } from "react";

import { JobCard } from "@/components/jobs/JobCard";
import { SearchSidebar } from "@/components/jobs/SearchSidebar";
import { SortToggle } from "@/components/jobs/SortToggle";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { getMasters, searchJobs } from "@/lib/jobs/api";
import {
  jobsHref,
  parseJobSearchParams,
  type RawSearchParams,
} from "@/lib/jobs/searchParams";

type SearchParamsProps = {
  searchParams: Promise<RawSearchParams>;
};

/**
 * 求人一覧。見出しと枠は静的な骨組みとして配信し、
 * URLの検索条件を読むサイドバーと検索結果は<Suspense>の中でリクエストごとに描画する
 */
export default function JobsPage({ searchParams }: PageProps<"/jobs">) {
  return (
    <>
      <section className="border-b-2 border-primary bg-tint-strong">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <Badge>JOBS</Badge>
          <h1 className="mt-3 text-3xl font-black text-primary sm:text-4xl">
            エンジニア求人を探す
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[280px_1fr]">
        <aside>
          <Suspense
            fallback={
              <div className="h-14 border-2 border-primary bg-tint lg:h-150" />
            }
          >
            <Sidebar searchParams={searchParams} />
          </Suspense>
        </aside>
        <section aria-label="検索結果">
          <Suspense fallback={<ResultsSkeleton />}>
            <Results searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </>
  );
}

async function Sidebar({ searchParams }: SearchParamsProps) {
  const masters = await getMasters();
  const params = parseJobSearchParams(await searchParams, masters);

  return <SearchSidebar masters={masters} params={params} />;
}

async function Results({ searchParams }: SearchParamsProps) {
  const masters = await getMasters();
  const params = parseJobSearchParams(await searchParams, masters);
  const { data: jobs, meta } = await searchJobs(params);

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-body">
          <span className="mr-1 font-display text-2xl font-bold text-primary">
            {meta.total.toLocaleString()}
          </span>
          件の求人
        </p>
        <SortToggle params={params} />
      </div>

      {jobs.length > 0 ? (
        <div className="flex flex-col gap-10">
          <ul className="grid gap-6 sm:grid-cols-2">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            getHref={(page) => jobsHref({ ...params, page })}
          />
        </div>
      ) : meta.total > 0 ? (
        // 最後のページより先の番号が手入力された場合
        <EmptyResults
          message="このページに求人はありません。"
          href={jobsHref({ ...params, page: 1 })}
          linkLabel="1ページ目に戻る"
        />
      ) : (
        <EmptyResults
          message="条件に合う求人はありません。条件を減らして探してみてください。"
          href={jobsHref({ sort: params.sort })}
          linkLabel="条件をクリア"
        />
      )}
    </>
  );
}

type EmptyResultsProps = {
  message: string;
  href: string;
  linkLabel: string;
};

function EmptyResults({ message, href, linkLabel }: EmptyResultsProps) {
  return (
    <div className="flex flex-col items-center gap-5 border-2 border-dashed border-line-soft bg-white px-6 py-16 text-center">
      <p className="text-sm text-ink-body">{message}</p>
      <Link href={href} className={buttonClass({ variant: "secondary" })}>
        {linkLabel}
      </Link>
    </div>
  );
}

/** 検索結果を読み込む間に出す、カードの形の枠 */
function ResultsSkeleton() {
  return (
    <div className="grid gap-6 pt-14 sm:grid-cols-2">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse border-2 border-primary/30 bg-white"
        />
      ))}
    </div>
  );
}
