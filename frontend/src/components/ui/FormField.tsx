import type { ComponentProps } from "react";

import { describedBy, Field } from "./Field";
import { TextInput } from "./TextInput";

type FormFieldProps = ComponentProps<"input"> & {
  label: string;
  /** 入力エラーのメッセージ。あれば入力欄の下に赤で表示する */
  error?: string;
  /** 入力のヒント(「8文字以上」など) */
  hint?: string;
};

/**
 * ラベル・1行の入力欄・ヒント・エラーメッセージの1組。react-hook-formのregister()の戻り値をそのまま渡せる
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
  const inputId = id ?? name ?? label;

  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint}>
      <TextInput
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        className={error ? "border-accent" : undefined}
        {...props}
      />
    </Field>
  );
}
