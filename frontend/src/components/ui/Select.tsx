import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

import { fieldClass } from "./TextInput";

/**
 * 紺の太枠のセレクトボックス。選択肢は<option>を子要素で渡す
 */
export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      // ブラウザ標準の下矢印は消す
      className={cn(fieldClass, "cursor-pointer appearance-none", className)}
      {...props}
    />
  );
}
