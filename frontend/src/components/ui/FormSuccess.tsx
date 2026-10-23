import { CircleCheck } from "lucide-react";

type FormSuccessProps = {
  message?: string;
};

/**
 * 保存できたことなどを、フォームの上に紺の枠で知らせる。メッセージがなければ何も出さない
 */
export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      className="flex items-start gap-2 border-2 border-primary bg-tint px-4 py-3 text-sm font-bold text-primary"
    >
      <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
