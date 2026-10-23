import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type LogoProps = {
  size?: "md" | "sm";
  /** falseにするとリンクにしない(企業向けページでは、求職者向けのトップページへ移動させないため) */
  linked?: boolean;
};

/**
 * サービスのロゴ(「T」マーク+「Tech Match」)。押すとトップページへ戻る
 */
export function Logo({ size = "md", linked = true }: LogoProps) {
  const content = (
    <>
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
    </>
  );
  const className = "flex items-center gap-2.5 text-primary";

  if (!linked) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href="/" className={className} aria-label="Tech Match トップページ">
      {content}
    </Link>
  );
}
