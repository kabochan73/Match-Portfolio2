"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { describedBy, Field } from "@/components/ui/Field";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import type { WorkExperience } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/forms/applyServerErrors";
import { mastersQueryOptions } from "@/lib/masters/queries";
import { formatYearMonth } from "@/lib/utils/date";

import { ProfileItemList, useSaveProfileItem } from "./ProfileItemList";

const ENDPOINT = "/seeker/work-experiences";

/** 年月(YYYY-MM)。type="month"に対応していないブラウザでは文字で入力するため、形式も確かめる */
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// 終了年月が開始年月より前でないか・未来でないかなどはサーバーで確かめる
const workExperienceSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, "会社名を入力してください")
    .max(255, "255文字以内で入力してください"),
  started_on: z
    .string()
    .regex(YEAR_MONTH, "入社年月を「2020-04」の形で入力してください"),
  ended_on: z
    .string()
    .refine(
      (value) => value === "" || YEAR_MONTH.test(value),
      "退社年月を「2023-03」の形で入力してください",
    ),
  employment_type: z.string().min(1, "雇用形態を選んでください"),
});

type WorkExperienceValues = z.infer<typeof workExperienceSchema>;

/**
 * 職歴の一覧と、追加・編集のダイアログ
 */
export function WorkExperiencesEditor({ items }: { items: WorkExperience[] }) {
  // nullは閉じている、"new"は追加、それ以外は編集する職歴
  const [editing, setEditing] = useState<WorkExperience | "new" | null>(null);

  return (
    <>
      <ProfileItemList
        items={items}
        noun="職歴"
        endpoint={ENDPOINT}
        itemName={(item) => item.company_name}
        renderItem={(item) => (
          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-ink">{item.company_name}</p>
            <p className="text-sm text-ink-sub">
              {formatYearMonth(item.started_on)}〜
              {item.ended_on ? formatYearMonth(item.ended_on) : "在籍中"}
              <span className="ml-3">{item.employment_type.label}</span>
            </p>
          </div>
        )}
        onAdd={() => setEditing("new")}
        onEdit={setEditing}
      />
      <Dialog
        open={editing !== null}
        title={editing === "new" ? "職歴を追加" : "職歴を編集"}
        onClose={() => setEditing(null)}
      >
        {editing !== null && (
          <WorkExperienceForm
            key={editing === "new" ? "new" : editing.id}
            item={editing === "new" ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>
    </>
  );
}

type WorkExperienceFormProps = {
  item: WorkExperience | null;
  onDone: () => void;
};

function WorkExperienceForm({ item, onDone }: WorkExperienceFormProps) {
  const { data: masters } = useQuery(mastersQueryOptions());
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WorkExperienceValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      company_name: item?.company_name ?? "",
      started_on: item?.started_on ?? "",
      ended_on: item?.ended_on ?? "",
      employment_type: item?.employment_type.value ?? "",
    },
  });
  const save = useSaveProfileItem<object>(ENDPOINT, item?.id ?? null);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        save.mutate(
          // 退社年月が空なら在籍中
          { ...values, ended_on: values.ended_on || null },
          {
            onSuccess: onDone,
            onError: (error) =>
              applyServerErrors(error, setError, [
                "company_name",
                "started_on",
                "ended_on",
                "employment_type",
              ]),
          },
        ),
      )}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={errors.root?.message} />
      <FormField
        label="会社名"
        placeholder="例: 株式会社テックマッチ"
        error={errors.company_name?.message}
        {...register("company_name")}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="入社年月"
          type="month"
          placeholder="2020-04"
          error={errors.started_on?.message}
          {...register("started_on")}
        />
        <FormField
          label="退社年月"
          type="month"
          placeholder="2023-03"
          hint="在籍中なら空欄"
          error={errors.ended_on?.message}
          {...register("ended_on")}
        />
      </div>
      <Field
        label="雇用形態"
        htmlFor="employment_type"
        error={errors.employment_type?.message}
      >
        <Select
          id="employment_type"
          aria-invalid={errors.employment_type ? true : undefined}
          aria-describedby={describedBy(
            "employment_type",
            errors.employment_type?.message,
          )}
          {...register("employment_type")}
        >
          <option value="">選んでください</option>
          {masters?.employment_types.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
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
