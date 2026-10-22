import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

/** 入力欄(テキスト・セレクト)に共通の見た目 */
export const fieldClass = cn(
  "h-11 w-full border-2 border-primary bg-white px-3 text-sm text-ink placeholder:text-ink-sub/70",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
);

/**
 * 紺の太枠の1行入力欄
 */
export function TextInput({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return <input type={type} className={cn(fieldClass, className)} {...props} />;
}
