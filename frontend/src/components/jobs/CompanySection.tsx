import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PublicCompany } from "@/lib/api/types";

type CompanySectionProps = {
  company: PublicCompany;
};

/**
 * 求人詳細のサイドバーに置く「この求人を出している会社」。カード全体が企業ページへのリンクになる
 */
export function CompanySection({ company }: CompanySectionProps) {
  // 未登録の項目は出さない
  const facts = [
    {
      label: "設立年",
      value: company.founded_year && `${company.founded_year}年`,
    },
    {
      label: "メンバー",
      value:
        company.member_count && `${company.member_count.toLocaleString()}名`,
    },
    { label: "場所", value: company.prefecture?.label },
  ].filter((fact) => fact.value);

  return (
    <Link
      href={`/companies/${company.id}`}
      // 求人カードと同じく、乗せると少し浮き上がる
      className="group flex flex-col gap-4 border-2 border-primary bg-white p-5 shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden border-2 border-primary bg-white text-lg font-bold text-primary">
          {company.avatar_url ? (
            <Image
              src={company.avatar_url}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            company.name.slice(0, 1)
          )}
        </div>
        <p className="min-w-0 text-lg leading-snug font-bold text-ink group-hover:underline group-hover:underline-offset-4">
          {company.name}
        </p>
      </div>

      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
          {facts.map(({ label, value }) => (
            <div key={label} className="contents">
              <dt className="text-xs leading-5 font-bold text-ink-sub">
                {label}
              </dt>
              <dd className="font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {company.introduction && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
          {company.introduction}
        </p>
      )}

      {/* 押すと企業ページへ進めることを示す */}
      <p className="flex items-center justify-end gap-1 border-t-2 border-tint pt-3 text-sm font-bold text-primary">
        企業ページを見る
        <ChevronRight className="size-4" aria-hidden />
      </p>
    </Link>
  );
}
