import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-mergeはTailwind標準のクラスしか知らないため、globals.cssで定義した独自の影の名前を教える。
// これがないと、部品の既定のshadow-hardを、呼び出し側のshadow-noneなどで上書きできない
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["hard", "hard-sm", "hard-soft"],
    },
  },
});

/**
 * クラス名を組み立てる。条件付きのクラス(clsx)をまとめ、同じ種類のクラスが重なったら後から渡したものを優先する
 *
 * @example cn("px-4 shadow-hard", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
