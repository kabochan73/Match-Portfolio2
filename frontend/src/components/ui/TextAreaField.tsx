import type { ComponentProps } from "react";

import { describedBy, Field } from "./Field";
import { TextArea } from "./TextArea";

type TextAreaFieldProps = ComponentProps<"textarea"> & {
  label: string;
  id: string;
  /** 文字数の上限 */
  limit: number;
  /** 今の文字数(useWatchで数える) */
  length: number;
  error?: string;
};

/**
 * ラベル付きの複数行の入力欄。文字数と上限を「120 / 5,000」のように出し、超えたら赤にする
 */
export function TextAreaField({
  label,
  id,
  limit,
  length,
  error,
  ...props
}: TextAreaFieldProps) {
  return (
    <Field
      label={label}
      htmlFor={id}
      error={error}
      aside={
        <span
          className={
            length > limit
              ? "font-display text-xs font-bold text-accent"
              : "font-display text-xs text-ink-sub"
          }
        >
          {length.toLocaleString()} / {limit.toLocaleString()}
        </span>
      }
    >
      <TextArea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error)}
        className={error ? "border-accent" : undefined}
        {...props}
      />
    </Field>
  );
}
