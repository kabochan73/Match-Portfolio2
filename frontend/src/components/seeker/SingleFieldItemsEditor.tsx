"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormField } from "@/components/ui/FormField";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";

import { ProfileItemList, useSaveProfileItem } from "./ProfileItemList";

type Item = { id: number; value: string };

type SingleFieldItemsEditorProps = {
  /** 「学歴」「資格」 */
  noun: string;
  /** 入力欄のラベル(「学校名」「資格名」) */
  label: string;
  placeholder: string;
  /** APIの項目名(school_name・name) */
  field: string;
  /** 追加・編集・削除するAPI */
  endpoint: string;
  items: Item[];
};

/**
 * 項目が1つだけの一覧の編集(学歴・資格)。追加・編集はダイアログのフォームで行う
 */
export function SingleFieldItemsEditor({
  noun,
  label,
  placeholder,
  field,
  endpoint,
  items,
}: SingleFieldItemsEditorProps) {
  // nullは閉じている、"new"は追加、それ以外は編集する項目
  const [editing, setEditing] = useState<Item | "new" | null>(null);

  return (
    <>
      <ProfileItemList
        items={items}
        noun={noun}
        endpoint={endpoint}
        itemName={(item) => item.value}
        renderItem={(item) => <p className="text-ink">{item.value}</p>}
        onAdd={() => setEditing("new")}
        onEdit={setEditing}
      />
      <Dialog
        open={editing !== null}
        title={editing === "new" ? `${noun}を追加` : `${noun}を編集`}
        onClose={() => setEditing(null)}
      >
        {editing !== null && (
          <SingleFieldForm
            key={editing === "new" ? "new" : editing.id}
            item={editing === "new" ? null : editing}
            label={label}
            placeholder={placeholder}
            field={field}
            endpoint={endpoint}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>
    </>
  );
}

const schema = z.object({
  value: z
    .string()
    .trim()
    .min(1, "入力してください")
    .max(255, "255文字以内で入力してください"),
});

type FormValues = z.infer<typeof schema>;

type SingleFieldFormProps = {
  item: Item | null;
  label: string;
  placeholder: string;
  field: string;
  endpoint: string;
  onDone: () => void;
};

function SingleFieldForm({
  item,
  label,
  placeholder,
  field,
  endpoint,
  onDone,
}: SingleFieldFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: item?.value ?? "" },
  });
  const save = useSaveProfileItem<Record<string, string>>(
    endpoint,
    item?.id ?? null,
  );

  return (
    <form
      onSubmit={handleSubmit((values) =>
        save.mutate(
          { [field]: values.value },
          {
            onSuccess: onDone,
            // サーバーの項目名(school_name・name)を、フォームの入力欄に読み替える
            onError: (error) =>
              applyServerErrors(error, setError, ["value"], (serverField) =>
                serverField === field ? "value" : serverField,
              ),
          },
        ),
      )}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={errors.root?.message} />
      <FormField
        label={label}
        placeholder={placeholder}
        error={errors.value?.message}
        {...register("value")}
      />
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onDone} disabled={save.isPending}>
          キャンセル
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "保存中…" : "保存する"}
        </Button>
      </div>
    </form>
  );
}
