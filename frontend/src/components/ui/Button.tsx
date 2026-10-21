import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** ずらした影を付けて目立たせる(ページの主な行動を促すボタン用) */
  withShadow?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  // 紺の塗り: いちばん押してほしい操作
  primary: "border-primary bg-primary text-white hover:bg-ink",
  // 白に紺の枠線: 補助的な操作
  secondary: "border-primary bg-white text-primary hover:bg-tint",
  // 赤の塗り: 会員登録など、特に目立たせたい操作(使いすぎない)
  accent: "border-primary bg-accent text-white hover:opacity-90",
};

// 高さはタップしやすい44px以上にする
const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

/**
 * ボタンの見た目のクラス。<button>以外(Next.jsの<Link>など)にも同じ見た目を付けるために使う
 *
 * @example <Link href="/jobs" className={buttonClass({ size: "lg" })}>求人を探す</Link>
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  withShadow = false,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 border-2 font-bold whitespace-nowrap transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    // 押したときに影の分だけ沈んで見えるようにする
    withShadow &&
      "shadow-hard-sm active:translate-x-1 active:translate-y-1 active:shadow-none",
  );
}

type ButtonProps = ComponentProps<"button"> & ButtonStyleOptions;

export function Button({
  variant,
  size,
  withShadow,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClass({ variant, size, withShadow }), className)}
      {...props}
    />
  );
}
