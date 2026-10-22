import type { ReactNode } from "react";

type PageSectionProps = {
  title: string;
  children: ReactNode;
};

/**
 * 求人詳細・企業ページの本文の1セクション(左に紺の線を付けた見出し+中身)
 */
export function PageSection({ title, children }: PageSectionProps) {
  return (
    <section>
      <h2 className="mb-4 border-l-[6px] border-primary pl-3 text-lg font-bold text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * 企業が入力した長めの文章(仕事内容・カルチャーなど)。改行はそのまま表示する
 */
export function MultilineText({ text }: { text: string }) {
  return (
    <p className="leading-loose whitespace-pre-wrap text-ink-body">{text}</p>
  );
}
