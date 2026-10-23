import type { ReactNode } from "react";

import { Card } from "./Card";

type FormSectionProps = {
  title: string;
  children: ReactNode;
};

/**
 * 長いフォームを区切る、見出しの帯付きのカード(求人・企業ページの編集など)
 */
export function FormSection({ title, children }: FormSectionProps) {
  return (
    <Card>
      <h2 className="border-b-2 border-primary bg-tint px-5 py-3 font-bold text-primary">
        {title}
      </h2>
      <div className="flex flex-col gap-6 px-5 py-5">{children}</div>
    </Card>
  );
}
