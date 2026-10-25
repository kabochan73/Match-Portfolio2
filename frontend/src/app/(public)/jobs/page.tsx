import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { JobCard } from "@/components/jobs/JobCard";
import { SearchSidebar } from "@/components/jobs/SearchSidebar";
import { SortToggle } from "@/components/jobs/SortToggle";
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
 * 求人一覧。枠は静的な骨組みとして配信し、
 * URLの検索条件を読むサイドバーと検索結果は<Suspense>の中でリクエストごとに描画する
 */
export default function JobsPage({ searchParams }: PageProps<"/jobs">) {
  return (
    <>
      {/* 画面には出さないが、何のページかを読み上げ・検索エンジンに伝える */}
      <h1 className="sr-only">エンジニア求人を探す</h1>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[280px_1fr]">
        {/*
          PCではスクロールしても画面に残す。サイドバーは画面より縦に長いため、
          画面の高さに収めて中だけスクロールできるようにする(pr・pbはカードの影が切れないための余白)
        */}
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pr-2 lg:pb-2">
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
  // 本番のビルド環境からはLaravelに繋がらないため、ビルド時ではなくアクセス時に取得する(取得結果はキャッシュされる)
  await connection();
  const masters = await getMasters();
  const params = parseJobSearchParams(await searchParams, masters);

  return <SearchSidebar masters={masters} params={params} />;
}

async function Results({ searchParams }: SearchParamsProps) {
  await connection();
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
