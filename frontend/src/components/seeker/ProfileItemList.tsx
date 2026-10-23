"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormAlert } from "@/components/ui/FormAlert";
import { apiClientFetch } from "@/lib/api/client";
import { errorMessage } from "@/lib/forms/applyServerErrors";
import { seekerQueryKeys } from "@/lib/seeker/queries";

type ProfileItemListProps<T extends { id: number }> = {
  items: T[];
  /** 1件の表示 */
  renderItem: (item: T) => ReactNode;
  /** 削除の確認ダイアログに出す名前(「株式会社〇〇」など) */
  itemName: (item: T) => string;
  /** 「職歴」「学歴」「資格」 */
  noun: string;
  /** 削除するAPI(末尾にIDを付ける) */
  endpoint: string;
  onAdd: () => void;
  onEdit: (item: T) => void;
};

/**
 * 職歴・学歴・資格の一覧。各行に編集・削除のボタン、下に追加のボタンを置く(追加・編集のフォームは呼び出し側のダイアログ)
 */
export function ProfileItemList<T extends { id: number }>({
  items,
  renderItem,
  itemName,
  noun,
  endpoint,
  onAdd,
  onEdit,
}: ProfileItemListProps<T>) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<T | null>(null);

  const remove = useMutation({
    mutationFn: (item: T) =>
      apiClientFetch(`${endpoint}/${item.id}`, { method: "DELETE" }),
    onSettled: async () => {
      setDeleting(null);
      await queryClient.invalidateQueries({
        queryKey: seekerQueryKeys.profile,
      });
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <FormAlert
        message={remove.isError ? errorMessage(remove.error) : undefined}
      />
      {items.length > 0 ? (
        <ul className="divide-y divide-tint border-y border-tint">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
              <Button
                variant="secondary"
                aria-label={`${itemName(item)}を編集`}
                onClick={() => onEdit(item)}
                className="h-9 px-3"
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
              <Button
                variant="secondary"
                aria-label={`${itemName(item)}を削除`}
                onClick={() => setDeleting(item)}
                className="h-9 px-3"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-sub">{noun}はまだ登録されていません。</p>
      )}
      <Button variant="secondary" onClick={onAdd} className="self-start">
        <Plus className="size-4" aria-hidden />
        {noun}を追加
      </Button>

      {deleting && (
        <ConfirmDialog
          open
          title={`${noun}を削除しますか?`}
          confirmLabel="削除する"
          danger
          pending={remove.isPending}
          onConfirm={() => remove.mutate(deleting)}
          onClose={() => setDeleting(null)}
        >
          「{itemName(deleting)}」を削除します。
        </ConfirmDialog>
      )}
    </div>
  );
}

/**
 * 職歴・学歴・資格の追加(POST)・編集(PUT)。保存したらプロフィールを取り直す
 */
export function useSaveProfileItem<Values>(
  endpoint: string,
  id: number | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Values) =>
      apiClientFetch(id === null ? endpoint : `${endpoint}/${id}`, {
        method: id === null ? "POST" : "PUT",
        body: values,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: seekerQueryKeys.profile }),
  });
}
