import { ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { companyLocation, FactRow } from "@/components/companies/CompanyFacts";
import type { PublicCompany } from "@/lib/api/types";

type CompanySectionProps = {
  company: PublicCompany;
};

/**
 * 求人詳細のサイドバーに置く「この求人を出している会社」。企業ページの会社情報と同じ形にそろえる。
 * カード全体が企業ページへのリンクになる
 */
export function CompanySection({ company }: CompanySectionProps) {
  const location = companyLocation(company);

  return (
    <Link
      href={`/companies/${company.id}`}
      // 求人カードと同じく、乗せると少し浮き上がる
      className="group block border-2 border-primary bg-white shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="flex items-center gap-3 border-b-2 border-primary bg-tint px-5 py-4">
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
        <p className="min-w-0 leading-snug font-bold text-primary group-hover:underline group-hover:underline-offset-4">
          {company.name}
        </p>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        {/* 未入力の項目は行ごと出さない */}
        {(company.founded_year || company.member_count || location) && (
          <dl className="flex flex-col gap-4 text-sm">
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
      </div>
    </Link>
  );
}
