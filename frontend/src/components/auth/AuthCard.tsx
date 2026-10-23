import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  /** カードの下に置くリンク(「会員登録はこちら」など) */
  footer?: ReactNode;
};

/**
 * ログイン・会員登録・パスワードリセットの画面の枠(見出し帯付きのカード+下のリンク)。求職者・企業で共通
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card>
        <div className="border-b-2 border-primary bg-tint px-6 py-5">
          <h1 className="text-xl font-black text-primary">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-ink-body">{description}</p>
          )}
        </div>
        <div className="px-6 py-6">{children}</div>
      </Card>
      {footer && (
        <div className="flex flex-col items-center gap-2 text-sm">{footer}</div>
      )}
    </div>
  );
}
