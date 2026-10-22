import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";

/**
 * 企業が見つからないとき(存在しない・IDが数字でない)
 */
export default function CompanyNotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-bold text-ink">企業が見つかりませんでした</h1>
      <p className="text-sm text-ink-body">
        URLが間違っているか、企業が退会した可能性があります。
      </p>
      <Link href="/jobs" className={buttonClass({ withShadow: true })}>
        求人一覧へ
      </Link>
    </div>
  );
}
