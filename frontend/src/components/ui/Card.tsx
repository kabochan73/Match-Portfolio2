import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * 白い背景・紺の太い枠・ずらした影のカード(求人カード・検索サイドバー・各種パネル)
 */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-2 border-primary bg-white shadow-hard", className)}
      {...props}
    />
  );
}
