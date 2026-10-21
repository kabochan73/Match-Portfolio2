import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

type BadgeTone = "accent" | "primary" | "muted";

const toneClasses: Record<BadgeTone, string> = {
  // 赤: NEW・スーパーいいねなど、気づいてほしいもの
  accent: "bg-accent text-white",
  // 紺: 公開中・マッチなど、前向きな状態
  primary: "bg-primary text-white",
  // 水色: 下書き・募集終了・不成立など、落ち着いた状態
  muted: "bg-tint text-ink-sub",
};

type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
};

/**
 * 小さいラベル(NEW・求人の状態・応募状況など)
 */
export function Badge({ tone = "primary", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 font-display text-[11px] font-bold tracking-wider",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
