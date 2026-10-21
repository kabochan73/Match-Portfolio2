import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";

/**
 * トップページ(仮)。ヒーロー・コンセプト・新着求人などは、トップページの作り込みで置き換える
 */
export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <h1 className="text-4xl font-black text-primary">Tech Match</h1>
      <p className="text-ink-body">トップページは準備中です。</p>
      <Link
        href="/jobs"
        className={buttonClass({ size: "lg", withShadow: true })}
      >
        求人を探す
      </Link>
    </div>
  );
}
