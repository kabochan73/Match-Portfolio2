import type { ReactNode } from "react";

type FieldMessagesProps = {
  /** ヒント・エラーの要素のid(入力欄のaria-describedbyに指定する) */
  id: string;
  error?: string;
  hint?: string;
};

/**
 * 入力欄の下に出すヒントまたはエラー(エラーがあればヒントの代わりに赤で出す)
 */
function FieldMessages({ id, error, hint }: FieldMessagesProps) {
  if (error) {
    return (
      <p id={id} className="text-xs font-bold text-accent">
        {error}
      </p>
    );
  }

  return hint ? (
    <p id={id} className="text-xs text-ink-sub">
      {hint}
    </p>
  ) : null;
}

/** 入力欄に付けるaria-describedby(ヒントかエラーがあるときだけ) */
export function describedBy(
  inputId: string,
  error?: string,
  hint?: string,
): string | undefined {
  return error || hint ? `${inputId}-description` : undefined;
}

type FieldProps = {
  label: string;
  /** 入力欄のid(ラベルと結び付ける) */
  htmlFor: string;
  error?: string;
  hint?: string;
  /** ラベルの右に出す補足(「12 / 100」のような文字数など) */
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * 1つの入力欄の枠(ラベル・入力欄・ヒントまたはエラー)。入力欄にはdescribedBy()でaria-describedbyを付ける
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  aside,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-bold text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children}
      <FieldMessages id={`${htmlFor}-description`} error={error} hint={hint} />
    </div>
  );
}

type FieldGroupProps = {
  legend: string;
  /** ヒント・エラーの要素のidに使う名前 */
  name: string;
  error?: string;
  hint?: string;
  aside?: ReactNode;
  /** 見出しを画面に出さず、読み上げだけにする(すぐ上に同じ見出しがあるとき) */
  legendHidden?: boolean;
  children: ReactNode;
};

/**
 * チェックボックスの集まりなど、複数の入力をまとめた枠(<fieldset>)
 */
export function FieldGroup({
  legend,
  name,
  error,
  hint,
  aside,
  legendHidden = false,
  children,
}: FieldGroupProps) {
  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={describedBy(name, error, hint)}
    >
      <div className="flex items-end justify-between gap-3">
        <legend
          className={legendHidden ? "sr-only" : "text-sm font-bold text-ink"}
        >
          {legend}
        </legend>
        {/* 見出しを隠したときも右端に置く */}
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
      <FieldMessages id={`${name}-description`} error={error} hint={hint} />
    </fieldset>
  );
}
