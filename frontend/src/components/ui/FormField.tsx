import type { ComponentProps } from "react";

import { TextInput } from "./TextInput";

type FormFieldProps = ComponentProps<"input"> & {
  label: string;
  /** 入力エラーのメッセージ。あれば入力欄の下に赤で表示する */
  error?: string;
  /** 入力のヒント(「8文字以上」など) */
  hint?: string;
};

/**
 * ラベル・入力欄・ヒント・エラーメッセージの1組。react-hook-formのregister()の戻り値をそのまま渡せる
 *
 * @example <FormField label="メールアドレス" type="email" error={errors.email?.message} {...register("email")} />
 */
export function FormField({
  label,
  error,
  hint,
  id,
  name,
  ...props
}: FormFieldProps) {
  const inputId = id ?? name;
  const descriptionId = `${inputId}-description`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-bold text-ink">
        {label}
      </label>
      <TextInput
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? descriptionId : undefined}
        className={error ? "border-accent" : undefined}
        {...props}
      />
      {error ? (
        <p id={descriptionId} className="text-xs font-bold text-accent">
          {error}
        </p>
      ) : (
        hint && (
          <p id={descriptionId} className="text-xs text-ink-sub">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
