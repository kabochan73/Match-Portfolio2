import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

type TagVariant = "solid" | "outline";

const variantClasses: Record<TagVariant, string> = {
  // 紺の塗り: 職種
  solid: "bg-primary px-2 py-0.5 font-bold text-white",
  // 枠線: 技術スタック・働き方(英字が多いためfont-display)
  outline:
    "border-2 border-primary bg-base px-2 font-display font-medium text-primary",
};

type TagProps = ComponentProps<"span"> & {
  variant?: TagVariant;
};

/**
 * 表示用のタグ(職種・技術スタックなど)。押して選ぶ検索条件のタグは、別のボタン部品にする
 */
export function Tag({ variant = "outline", className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs leading-5",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
