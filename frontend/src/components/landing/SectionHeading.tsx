import type { ReactNode } from "react";

type SectionHeadingProps = {
  /** 見出しの上の英字ラベル(CONCEPT・HOW TO USEなど) */
  eyebrow: string;
  children: ReactNode;
  description?: string;
};

/**
 * トップページ・企業向けページの各セクションの見出し(赤い英字ラベル+大きい見出し+説明文)
 */
export function SectionHeading({
  eyebrow,
  children,
  description,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-start gap-3.5">
      <p className="font-display text-[13px] font-bold tracking-[0.14em] text-accent">
        {eyebrow}
      </p>
      <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-snug font-black text-primary">
        {children}
      </h2>
      {description && (
        <p className="max-w-180 leading-relaxed font-medium text-ink-body">
          {description}
        </p>
      )}
    </div>
  );
}
