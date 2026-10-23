import Image from "next/image";

import { cn } from "@/lib/utils/cn";

type AvatarProps = {
  /** 画像のURL。なければ名前の頭文字を出す */
  src: string | null;
  name: string;
  /** 一辺の長さ(px) */
  size: number;
  className?: string;
};

/**
 * 四角いアイコン(応募者の顔写真・会社のロゴ)。画像がなければ名前の頭文字を出す
 */
export function Avatar({ src, name, size, className }: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border-2 border-primary bg-tint font-bold text-primary",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span aria-hidden>{name.slice(0, 1)}</span>
      )}
    </div>
  );
}
