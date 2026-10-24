import { ExternalLink, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { PublicCompany } from "@/lib/api/types";

type CompanyFactsProps = {
  company: PublicCompany;
};

/**
 * 企業ページの会社情報(設立年・メンバー数・所在地・Webサイト・技術スタック・働き方)。
 * PCでは右の列に置き、スクロールしても画面に残す。未入力の項目は行ごと出さない
 */
export function CompanyFacts({ company }: CompanyFactsProps) {
  const location = companyLocation(company);

  return (
    <Card>
      <h2 className="border-b-2 border-primary bg-tint px-5 py-4 font-bold text-primary">
        会社情報
      </h2>

      <dl className="flex flex-col gap-4 px-5 py-5 text-sm">
        {company.founded_year && (
          <FactRow label="設立">
            <span className="font-display">{company.founded_year}</span>年
          </FactRow>
        )}
        {company.member_count && (
          <FactRow label="メンバー">
            <span className="font-display">
              {company.member_count.toLocaleString()}
            </span>
            名
          </FactRow>
        )}
        {location && (
          <FactRow label="所在地">
            <span className="flex items-start gap-1">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {location}
            </span>
          </FactRow>
        )}
        {company.website_url && (
          <FactRow label="Web">
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold break-all text-primary underline underline-offset-4"
            >
              {hostname(company.website_url)}
              <ExternalLink className="size-3.5 shrink-0" aria-hidden />
              <span className="sr-only">(新しいタブで開く)</span>
            </a>
          </FactRow>
        )}
        {company.tech_stacks && company.tech_stacks.length > 0 && (
          <FactRow label="技術">
            <span className="flex flex-wrap gap-1.5">
              {company.tech_stacks.map((techStack) => (
                <Tag key={techStack.id}>{techStack.name}</Tag>
              ))}
            </span>
          </FactRow>
        )}
        {company.work_styles && company.work_styles.length > 0 && (
          <FactRow label="働き方">
            <span className="flex flex-wrap gap-1.5">
              {company.work_styles.map((workStyle) => (
                <Tag key={workStyle.id}>{workStyle.name}</Tag>
              ))}
            </span>
          </FactRow>
        )}
      </dl>
    </Card>
  );
}

/** 所在地(都道府県と住所)。どちらも未入力なら空文字 */
export function companyLocation(company: PublicCompany): string {
  return [company.prefecture?.label, company.address_line]
    .filter(Boolean)
    .join(" ");
}

/** 会社情報の1行(求人詳細の企業カードでも使う) */
export function FactRow({
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

/** URLは長いため、ドメイン部分だけを表示する(https://www.example.com/about → www.example.com) */
function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
