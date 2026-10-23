import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * 紺の太枠の複数行の入力欄(仕事内容など、長めの文章用)
 */
export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full border-2 border-primary bg-white px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-sub/70",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
      {...props}
    />
  );
}
