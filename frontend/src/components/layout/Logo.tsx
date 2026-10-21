import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type LogoProps = {
  size?: "md" | "sm";
};

/**
 * サービスのロゴ(「T」マーク+「Tech Match」)。押すとトップページへ戻る
 */
export function Logo({ size = "md" }: LogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-primary"
      aria-label="Tech Match トップページ"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center bg-primary font-display font-bold text-white",
          size === "md" ? "size-7.5 text-base" : "size-6.5 text-sm",
        )}
      >
        T
      </span>
      <span
        className={cn(
          "font-display font-bold",
          size === "md" ? "text-lg" : "text-base",
        )}
      >
        Tech Match
      </span>
    </Link>
  );
}
