import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PublicCompany } from "@/lib/api/types";

type CompanySectionProps = {
  company: PublicCompany;
};

/**
 * 求人詳細の下に置く「この求人を出している会社」。カード全体が企業ページへのリンクになる
 */
export function CompanySection({ company }: CompanySectionProps) {
  const facts = [
    company.founded_year && `${company.founded_year}年設立`,
    company.member_count && `${company.member_count.toLocaleString()}名`,
    company.prefecture?.label,
  ].filter(Boolean);

  return (
    <Link
      href={`/companies/${company.id}`}
      // 求人カードと同じく、乗せると少し浮き上がる
      className="group flex flex-col gap-4 border-2 border-primary bg-white p-5 shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden border-2 border-primary bg-white text-lg font-bold text-primary">
          {company.avatar_url ? (
            <Image
              src={company.avatar_url}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            company.name.slice(0, 1)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink group-hover:underline group-hover:underline-offset-4">
            {company.name}
          </p>
          {facts.length > 0 && (
            <p className="mt-0.5 text-xs text-ink-sub">{facts.join(" / ")}</p>
          )}
        </div>
        {/* 押すと企業ページへ進めることを示す */}
        <ChevronRight className="size-5 shrink-0 text-primary" aria-hidden />
      </div>

      {company.introduction && (
        <p className="line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-body">
          {company.introduction}
        </p>
      )}
    </Link>
  );
}
