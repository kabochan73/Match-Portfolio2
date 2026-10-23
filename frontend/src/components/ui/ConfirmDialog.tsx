"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  /** 実行するボタンの文言(「削除する」など) */
  confirmLabel: string;
  /** 取り返しのつかない操作は赤にする */
  danger?: boolean;
  /** 実行中は、ボタンを押せなくする */
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * 操作の確認ダイアログ(ブラウザ標準の<dialog>。Escキー・背景で閉じられ、開いている間は後ろを操作できない)
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  danger = false,
  pending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
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
      className="m-auto w-[min(28rem,calc(100%-2rem))] border-2 border-primary bg-white p-0 shadow-hard backdrop:bg-ink/50"
    >
      <div className="flex flex-col gap-5 p-6">
        <h2 className="text-lg font-black text-primary">{title}</h2>
        <div className="text-sm leading-relaxed text-ink-body">{children}</div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            キャンセル
          </Button>
          <Button
            variant={danger ? "accent" : "primary"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "処理中…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
