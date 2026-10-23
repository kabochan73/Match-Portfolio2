"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { describedBy, FieldGroup } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/TextInput";
import {
  type JobPostingFormValues,
  MAX_SELECTION_STEPS,
} from "@/lib/company/jobPostingForm";

type SelectionStepsInputProps = {
  control: Control<JobPostingFormValues>;
  register: UseFormRegister<JobPostingFormValues>;
  errors: FieldErrors<JobPostingFormValues>;
};

/**
 * 選考フローの入力(1〜6ステップ)。ステップの追加・削除・並べ替えができる
 */
export function SelectionStepsInput({
  control,
  register,
  errors,
}: SelectionStepsInputProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "selection_steps",
  });

  // ステップ数の不足・超過など、選考フロー全体のエラー
  const groupError =
    errors.selection_steps?.message ?? errors.selection_steps?.root?.message;

  return (
    <FieldGroup
      legend="選考フロー"
      // カードの見出しにも「選考フロー」とあるため、画面には出さない
      legendHidden
      name="selection_steps"
      error={groupError}
      hint="カジュアル面談 → 一次面接 → 最終面接 のように、順番に入力します"
      aside={
        <span className="font-display text-xs text-ink-sub">
          {fields.length} / {MAX_SELECTION_STEPS}
        </span>
      }
    >
      <ol className="flex flex-col gap-2">
        {fields.map((field, index) => {
          const inputId = `selection_steps-${index}`;
          const error = errors.selection_steps?.[index]?.name?.message;

          return (
            <li key={field.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center bg-primary font-display text-sm font-bold text-white">
                  {index + 1}
                </span>
                <label htmlFor={inputId} className="sr-only">
                  ステップ{index + 1}
                </label>
                <TextInput
                  id={inputId}
                  placeholder="例: カジュアル面談"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy(inputId, error)}
                  className={error ? "border-accent" : undefined}
                  {...register(`selection_steps.${index}.name`)}
                />
                <IconButton
                  label={`ステップ${index + 1}を上へ`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </IconButton>
                <IconButton
                  label={`ステップ${index + 1}を下へ`}
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </IconButton>
                <IconButton
                  label={`ステップ${index + 1}を削除`}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </IconButton>
              </div>
              {error && (
                <p
                  id={`${inputId}-description`}
                  className="pl-11 text-xs font-bold text-accent"
                >
                  {error}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <Button
        variant="secondary"
        className="self-start"
        disabled={fields.length >= MAX_SELECTION_STEPS}
        onClick={() => append({ name: "" })}
      >
        <Plus className="size-4" aria-hidden />
        ステップを追加
      </Button>
    </FieldGroup>
  );
}

type IconButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function IconButton({ label, disabled, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 shrink-0 cursor-pointer items-center justify-center border-2 border-primary bg-white text-primary transition hover:bg-tint disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
    >
      {children}
    </button>
  );
}
