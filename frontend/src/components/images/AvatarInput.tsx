"use client";

import { useMutation } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button, buttonClass } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormAlert } from "@/components/ui/FormAlert";
import { apiClientFetch } from "@/lib/api/client";
import { errorMessage } from "@/lib/forms/applyServerErrors";
import { ACCEPTED_IMAGE_TYPES, resizeImage } from "@/lib/images/resizeImage";
import { cn } from "@/lib/utils/cn";

type AvatarInputProps = {
  imageUrl: string | null;
  /** 画像がないときに頭文字を出す名前 */
  name: string;
  /** 登録・削除するAPI(POSTでフィールド名avatarを送り、DELETEで削除する) */
  path: string;
  /** 「ロゴ」「アイコン」など */
  label: string;
  /** 変更・削除したあと(呼び出し側で取り直す) */
  onChanged: () => Promise<unknown>;
};

/**
 * ロゴ・アイコンの入力。選んだ時点でアップロードし、正方形に切り抜かれて保存される
 */
export function AvatarInput({
  imageUrl,
  name,
  path,
  label,
  onChanged,
}: AvatarInputProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("avatar", await resizeImage(file));

      return apiClientFetch(path, { method: "POST", body });
    },
    onSettled: () => onChanged(),
  });

  const remove = useMutation({
    mutationFn: () => apiClientFetch(path, { method: "DELETE" }),
    onSettled: async () => {
      setConfirmingDelete(false);
      await onChanged();
    },
  });

  const error = upload.isError
    ? errorMessage(upload.error)
    : remove.isError
      ? errorMessage(remove.error)
      : undefined;

  return (
    <div className="flex flex-col gap-3">
      <FormAlert message={error} />
      <div className="flex flex-wrap items-center gap-5">
        <Avatar src={imageUrl} name={name} size={96} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-3">
            <label
              className={cn(
                buttonClass({ variant: "secondary" }),
                "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
                upload.isPending && "pointer-events-none opacity-50",
              )}
            >
              <ImagePlus className="size-4" aria-hidden />
              {upload.isPending
                ? "アップロード中…"
                : imageUrl
                  ? `${label}を変更`
                  : `${label}を登録`}
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                disabled={upload.isPending}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    upload.mutate(file);
                  }
                  event.target.value = "";
                }}
              />
            </label>
            {imageUrl && (
              <Button
                variant="secondary"
                onClick={() => setConfirmingDelete(true)}
              >
                削除
              </Button>
            )}
          </div>
          <p className="text-xs text-ink-sub">
            JPEG・PNG・WebP。正方形に切り抜いて表示されます。選んだ時点で保存されます。
          </p>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          open
          title={`${label}を削除しますか?`}
          confirmLabel="削除する"
          danger
          pending={remove.isPending}
          onConfirm={() => remove.mutate()}
          onClose={() => setConfirmingDelete(false)}
        >
          削除すると、{label}の代わりに名前の頭文字が表示されます。
        </ConfirmDialog>
      )}
    </div>
  );
}
