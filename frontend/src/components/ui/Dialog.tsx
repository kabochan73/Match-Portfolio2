"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/utils/cn";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** 幅(標準は28rem) */
  className?: string;
};

/**
 * ダイアログ(ブラウザ標準の<dialog>。Escキー・背景で閉じられ、開いている間は後ろを操作できない)
 */
export function Dialog({
  open,
  title,
  children,
  onClose,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog?.open) {
      dialog?.showModal();
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // 背景(ダイアログの外)を押したら閉じる
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        "m-auto w-[min(28rem,calc(100%-2rem))] border-2 border-primary bg-white p-0 shadow-hard backdrop:bg-ink/50",
        className,
      )}
    >
      <div className="flex flex-col gap-5 p-6">
        <h2 className="text-lg font-black text-primary">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
