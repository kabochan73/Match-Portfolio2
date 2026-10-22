"use client";

import Image from "next/image";
import { useState } from "react";

import type { Image as GalleryImage } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type GalleryProps = {
  images: GalleryImage[];
  /** 画像の代替テキストに使う(「求人タイトル 1枚目」「会社名 1枚目」のように読み上げる) */
  title: string;
};

/**
 * 画像ギャラリー(求人票・企業ページ。最大5枚)。サムネイルを押すと大きい画像が切り替わる。
 * 画像がない場合は、求人カードと同じ方眼の枠を出す
 */
export function Gallery({ images, title }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video border-2 border-primary bg-page bg-[linear-gradient(var(--color-line-soft)_1px,transparent_1px),linear-gradient(90deg,var(--color-line-soft)_1px,transparent_1px)] bg-size-[20px_20px] shadow-hard">
        {selected && (
          <Image
            src={selected.url}
            alt={`${title} ${selectedIndex + 1}枚目`}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
            // 最初に見える大きい画像は先に読み込む
            preload={selectedIndex === 0}
          />
        )}
      </div>

      {/* 1枚だけなら切り替える必要がないため、サムネイルは2枚以上のときだけ出す */}
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((image, index) => {
            const isSelected = index === selectedIndex;

            return (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`${index + 1}枚目を表示`}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative block aspect-video w-full cursor-pointer border-2 border-primary transition",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    isSelected
                      ? "shadow-hard-sm"
                      : "opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
