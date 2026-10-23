import { CircleAlert } from "lucide-react";

type FormAlertProps = {
  message?: string;
};

/**
 * フォーム全体に関わるエラー(通信の失敗など)を、フォームの上に赤枠で表示する。メッセージがなければ何も出さない
 */
export function FormAlert({ message }: FormAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="flex items-start gap-2 border-2 border-accent bg-white px-4 py-3 text-sm font-bold text-accent"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
