import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
};

/**
 * 四角い紺枠のチェックボックス。選ぶと内側が紺で塗られる(ラベルごと押せる)
 */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 py-1.5 text-sm text-ink-body",
        className,
      )}
    >
      <input
        type="checkbox"
        className={cn(
          "size-5 shrink-0 cursor-pointer appearance-none border-2 border-primary bg-white",
          // 白い余白を残して内側だけ塗る
          "checked:bg-primary checked:shadow-[inset_0_0_0_3px_white]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        )}
        {...props}
      />
      {label}
    </label>
  );
}

/**
 * タグの見た目のチェックボックス(技術スタックの選択用)。選ぶと紺の塗りに変わる
 */
export function TagCheckbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center border-2 border-primary bg-white px-2.5 py-1 font-display text-xs font-medium text-primary transition",
        "hover:bg-tint has-checked:bg-primary has-checked:text-white",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
        // 選べる数の上限に達したときなど、押せない状態
        "has-disabled:cursor-not-allowed has-disabled:opacity-40 has-disabled:hover:bg-white",
        className,
      )}
    >
      <input type="checkbox" className="sr-only" {...props} />
      {label}
    </label>
  );
}
