import { Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Tag } from "@/components/ui/Tag";
import type { CompanySummary, JobPostingSummary } from "@/lib/api/types";
import { formatSalary } from "@/lib/jobs/format";

type JobCardProps = {
  job: JobPostingSummary;
};

/**
 * 求人一覧・企業ページ・トップページの求人カード。カード全体が求人詳細へのリンクになる。
 * 職種(最大3)・技術スタック(最大5)は数が限られているため、省略せずすべて表示する
 */
export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex h-full flex-col border-2 border-primary bg-white shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="relative aspect-video border-b-2 border-primary bg-page bg-[linear-gradient(var(--color-line-soft)_1px,transparent_1px),linear-gradient(90deg,var(--color-line-soft)_1px,transparent_1px)] bg-size-[20px_20px]">
        {job.cover_image_url && (
          <Image
            src={job.cover_image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
        {job.is_new && (
          <Badge tone="accent" className="absolute top-3 left-0">
            NEW
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {job.company && <CompanyLine company={job.company} />}

        <h3 className="line-clamp-2 leading-relaxed font-bold text-ink group-hover:underline group-hover:underline-offset-4">
          {job.title}
        </h3>

        {/* 職種と技術スタックは行を分けて、どちらのタグか見分けやすくする */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {job.job_categories.map((jobCategory) => (
              <Tag key={jobCategory.id} variant="solid">
                {jobCategory.name}
              </Tag>
            ))}
          </div>
          {job.tech_stacks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.tech_stacks.map((techStack) => (
                <Tag key={techStack.id}>{techStack.name}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* 下端にそろえる */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t-2 border-primary pt-3">
          <p className="flex items-center gap-3 text-sm font-medium text-ink-body">
            {/* ピンで勤務地だと分かるようにする */}
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {job.prefecture.label}
            </span>
            <span>{job.employment_type.label}</span>
          </p>
          <div className="flex items-center gap-3">
            <p className="font-bold whitespace-nowrap text-ink">
              月給{" "}
              <span className="font-display text-lg">
                {formatSalary(job.salary)}
              </span>
            </p>
            <p
              className="flex items-center gap-1 font-display text-xs font-bold text-accent"
              aria-label={`いいね${job.likes_count}件`}
            >
              <Heart className="size-3.5 fill-current" aria-hidden />
              {job.likes_count}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** 会社のロゴ(なければ頭文字)と会社名 */
function CompanyLine({ company }: { company: CompanySummary }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-primary bg-white text-sm font-bold text-primary">
        {company.avatar_url ? (
          <Image
            src={company.avatar_url}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          company.name.slice(0, 1)
        )}
      </div>
      <p className="truncate text-lg font-bold text-ink-body">{company.name}</p>
    </div>
  );
}
