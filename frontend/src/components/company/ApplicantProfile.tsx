import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { MultilineText, PageSection } from "@/components/ui/PageSection";
import type { Applicant } from "@/lib/api/types";
import { formatYearMonth } from "@/lib/utils/date";

type ApplicantProfileProps = {
  applicant: Applicant;
};

/**
 * 応募者のプロフィール(自己紹介・ポートフォリオ・職歴・学歴・資格)。履歴書・職務経歴書の代わりになる部分
 */
export function ApplicantProfile({ applicant }: ApplicantProfileProps) {
  const workExperiences = applicant.work_experiences ?? [];
  const educations = applicant.educations ?? [];
  const certifications = applicant.certifications ?? [];

  return (
    <div className="flex flex-col gap-10">
      <PageSection title="自己紹介">
        {applicant.comment ? (
          <MultilineText text={applicant.comment} />
        ) : (
          <Empty />
        )}
      </PageSection>

      <PageSection title="ポートフォリオ">
        {applicant.portfolio_url ? (
          <a
            href={applicant.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold break-all text-primary underline underline-offset-4"
          >
            {applicant.portfolio_url}
            <ExternalLink className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">(新しいタブで開く)</span>
          </a>
        ) : (
          <Empty />
        )}
      </PageSection>

      <PageSection title="職歴">
        {workExperiences.length > 0 ? (
          <List>
            {workExperiences.map((work) => (
              <li key={work.id} className="flex flex-col gap-0.5 py-3">
                <p className="font-bold text-ink">{work.company_name}</p>
                <p className="text-sm text-ink-sub">
                  {formatYearMonth(work.started_on)}〜
                  {work.ended_on ? formatYearMonth(work.ended_on) : "在籍中"}
                  <span className="ml-3">{work.employment_type.label}</span>
                </p>
              </li>
            ))}
          </List>
        ) : (
          <Empty />
        )}
      </PageSection>

      <PageSection title="学歴">
        {educations.length > 0 ? (
          <List>
            {educations.map((education) => (
              <li key={education.id} className="py-3 text-ink">
                {education.school_name}
              </li>
            ))}
          </List>
        ) : (
          <Empty />
        )}
      </PageSection>

      <PageSection title="資格">
        {certifications.length > 0 ? (
          <List>
            {certifications.map((certification) => (
              <li key={certification.id} className="py-3 text-ink">
                {certification.name}
              </li>
            ))}
          </List>
        ) : (
          <Empty />
        )}
      </PageSection>
    </div>
  );
}

function List({ children }: { children: ReactNode }) {
  return (
    <ul className="divide-y divide-tint border-y border-tint">{children}</ul>
  );
}

function Empty() {
  return <p className="text-sm text-ink-sub">登録されていません</p>;
}
