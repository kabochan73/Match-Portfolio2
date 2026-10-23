import Link from "next/link";
import { connection } from "next/server";

import { getMasters } from "@/lib/jobs/api";
import { jobsHref } from "@/lib/jobs/searchParams";

/**
 * トップページに並べる技術スタック。全46件だと長すぎるため、求人の多い定番に絞る(マスタにない名前は表示しない)
 */
const FEATURED_TECH_STACKS = [
  "PHP",
  "Laravel",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Python",
  "Django",
  "Ruby",
  "Ruby on Rails",
  "Go",
  "Java",
  "Kotlin",
  "Swift",
  "Flutter",
  "AWS",
  "GCP",
  "Docker",
  "Kubernetes",
];

/**
 * 技術スタックから探す(押すとその技術で絞り込んだ求人一覧へ)。<Suspense>の中に置く
 */
export async function TechStackLinks() {
  // 本番のビルド環境からはLaravelに繋がらないため、ビルド時ではなくアクセス時に取得する(取得結果はキャッシュされる)
  await connection();
  const { tech_stacks: techStacks } = await getMasters();
  const featured = FEATURED_TECH_STACKS.flatMap((name) =>
    techStacks.filter((techStack) => techStack.name === name),
  );

  return (
    <ul className="flex flex-wrap gap-3">
      {featured.map((techStack) => (
        <li key={techStack.id}>
          <Link
            href={jobsHref({ techStackIds: [techStack.id] })}
            className="inline-flex h-11 items-center border-2 border-primary bg-white px-4.5 font-display text-sm font-bold text-primary shadow-[3px_3px_0_var(--color-primary)] transition hover:bg-tint active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
          >
            {techStack.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 読み込む間に出す、タグの形の枠 */
export function TechStackLinksSkeleton() {
  return (
    <div className="flex animate-pulse flex-wrap gap-3">
      {FEATURED_TECH_STACKS.map((name) => (
        <div
          key={name}
          className="h-11 w-24 border-2 border-primary/30 bg-white"
        />
      ))}
    </div>
  );
}
