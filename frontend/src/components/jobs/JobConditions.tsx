import { Heart, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { JobPostingDetail } from "@/lib/api/types";
import { formatSalary } from "@/lib/jobs/format";

type JobConditionsProps = {
  /** 使う項目だけを受け取り、企業の求人管理の詳細からも渡せるようにする */
  job: Pick<
    JobPostingDetail,
    | "salary"
    | "prefecture"
    | "employment_type"
    | "job_categories"
    | "tech_stacks"
    | "likes_count"
  >;
};

/**
 * 求人詳細の条件(月給・勤務地・雇用形態・職種・技術スタック・いいね数)。PCでは右の列に置き、スクロールしても画面に残す。
 * 求人管理の詳細でも、公開ページと同じ見え方を確かめられるよう同じカードを使う
 */
export function JobConditions({ job }: JobConditionsProps) {
  return (
    <Card>
      <div className="border-b-2 border-primary bg-tint px-5 py-4">
        <p className="text-xs font-bold text-ink-sub">月給</p>
        <p className="font-display text-3xl font-bold text-primary">
          {formatSalary(job.salary)}
          <span className="font-sans text-base">円</span>
        </p>
      </div>

      <dl className="flex flex-col gap-4 px-5 py-5 text-sm">
        <ConditionRow label="勤務地">
          <span className="flex items-center gap-1">
            <MapPin className="size-4" aria-hidden />
            {job.prefecture.label}
          </span>
        </ConditionRow>
        <ConditionRow label="雇用形態">
          {job.employment_type.label}
        </ConditionRow>
        <ConditionRow label="職種">
          <span className="flex flex-wrap gap-1.5">
            {job.job_categories.map((jobCategory) => (
              <Tag key={jobCategory.id} variant="solid">
                {jobCategory.name}
              </Tag>
            ))}
          </span>
        </ConditionRow>
        {job.tech_stacks.length > 0 && (
          <ConditionRow label="技術">
            <span className="flex flex-wrap gap-1.5">
              {job.tech_stacks.map((techStack) => (
                <Tag key={techStack.id}>{techStack.name}</Tag>
              ))}
            </span>
          </ConditionRow>
        )}
        <ConditionRow label="応募">
          <span className="flex items-center gap-1 font-bold text-accent">
            <Heart className="size-4 fill-current" aria-hidden />
            <span className="font-display">{job.likes_count}</span>件
          </span>
        </ConditionRow>
      </dl>
    </Card>
  );
}

function ConditionRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-start gap-2">
      <dt className="pt-0.5 text-xs font-bold text-ink-sub">{label}</dt>
      <dd className="text-ink-body">{children}</dd>
    </div>
  );
}
