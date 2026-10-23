"use client";

import type { ReactNode } from "react";

import { Button } from "./Button";
import { Dialog } from "./Dialog";

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
 * 操作の確認ダイアログ(本文と「キャンセル」「実行」のボタン)
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
  return (
    <Dialog open={open} title={title} onClose={onClose}>
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
    </Dialog>
  );
}
