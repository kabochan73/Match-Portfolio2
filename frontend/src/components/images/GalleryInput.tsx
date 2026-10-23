"use client";

import { useMutation } from "@tanstack/react-query";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormAlert } from "@/components/ui/FormAlert";
import { apiClientFetch } from "@/lib/api/client";
import type { Image as GalleryImage } from "@/lib/api/types";
import { errorMessage } from "@/lib/forms/applyServerErrors";
import { ACCEPTED_IMAGE_TYPES, resizeImage } from "@/lib/images/resizeImage";

type GalleryInputProps = {
  images: GalleryImage[];
  /** 登録できる枚数(Laravelのバリデーションと合わせる) */
  max: number;
  /** 1枚追加するAPI(フィールド名imageで1枚ずつ送る) */
  uploadPath: string;
  /** 1枚削除するAPI(末尾に画像のIDを付ける) */
  deletePathPrefix: string;
  /** 1枚目の写真に付ける説明(「カバー画像」など) */
  firstLabel: string;
  /** 追加・削除したあと(呼び出し側で画像の一覧を取り直す) */
  onChanged: () => Promise<unknown>;
};

/**
 * 写真のギャラリーの入力。選んだ時点で1枚ずつアップロードし、✕で削除する(並べ替えはできず、登録した順に並ぶ)
 */
export function GalleryInput({
  images,
  max,
  uploadPath,
  deletePathPrefix,
  firstLabel,
  onChanged,
}: GalleryInputProps) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [notice, setNotice] = useState<string>();
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);
  const remaining = max - images.length;

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      // サーバーは1回に1枚ずつ受け付けるため、順番に送る。
      // 1枚が失敗しても残りは送り、最後に最初の失敗の理由を表示する
      let firstError: unknown = null;

      for (const file of files) {
        try {
          const body = new FormData();
          body.append("image", await resizeImage(file));
          await apiClientFetch(uploadPath, { method: "POST", body });
        } catch (error) {
          firstError ??= error;
        }
        setUploadingCount((count) => count - 1);
      }

      if (firstError) {
        throw firstError;
      }
    },
    onSettled: async () => {
      setUploadingCount(0);
      await onChanged();
    },
  });

  const remove = useMutation({
    mutationFn: (image: GalleryImage) =>
      apiClientFetch(`${deletePathPrefix}/${image.id}`, { method: "DELETE" }),
    onSettled: async () => {
      setDeleting(null);
      await onChanged();
    },
  });

  const selectFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    const accepted = files.slice(0, remaining);

    setNotice(
      files.length > accepted.length
        ? `写真は${max}枚までです。${files.length - accepted.length}枚は追加しませんでした。`
        : undefined,
    );

    if (accepted.length > 0) {
      setUploadingCount(accepted.length);
      upload.mutate(accepted);
    }
  };

  const error = upload.isError
    ? errorMessage(upload.error)
    : remove.isError
      ? errorMessage(remove.error)
      : notice;

  return (
    <div className="flex flex-col gap-3">
      <FormAlert message={error} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {images.map((image, index) => (
          <li
            key={image.id}
            className="relative aspect-video border-2 border-primary bg-tint"
          >
            <Image
              src={image.url}
              alt={`写真${index + 1}枚目`}
              fill
              sizes="240px"
              className="object-cover"
            />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 bg-primary px-1.5 py-0.5 text-[11px] font-bold text-white">
                {firstLabel}
              </span>
            )}
            <button
              type="button"
              aria-label={`写真${index + 1}枚目を削除`}
              onClick={() => setDeleting(image)}
              className="absolute top-1 right-1 flex size-7 cursor-pointer items-center justify-center border-2 border-primary bg-white text-primary transition hover:bg-tint"
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}

        {Array.from({ length: uploadingCount }, (_, index) => (
          <li
            key={`uploading-${index}`}
            className="flex aspect-video flex-col items-center justify-center gap-1 border-2 border-dashed border-line-soft bg-white text-xs font-bold text-ink-sub"
          >
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
            アップロード中
          </li>
        ))}

        {remaining - uploadingCount > 0 && (
          <li>
            {/* ファイル選択の入力は隠し、枠全体を押せるようにする */}
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-primary bg-white text-xs font-bold text-primary transition hover:bg-tint has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary">
              <ImagePlus className="size-6" aria-hidden />
              写真を追加
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                disabled={upload.isPending}
                className="sr-only"
                onChange={(event) => {
                  selectFiles(event.target.files);
                  // 同じファイルをもう一度選んでも反応するよう、選択を空に戻す
                  event.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>
      <p className="text-xs text-ink-sub">
        JPEG・PNG・WebP、{max}枚まで(今{images.length}
        枚)。選んだ時点で保存され、登録した順に並びます。
      </p>

      {deleting && (
        <ConfirmDialog
          open
          title="写真を削除しますか?"
          confirmLabel="削除する"
          danger
          pending={remove.isPending}
          onConfirm={() => remove.mutate(deleting)}
          onClose={() => setDeleting(null)}
        >
          削除した写真は元に戻せません。
        </ConfirmDialog>
      )}
    </div>
  );
}
