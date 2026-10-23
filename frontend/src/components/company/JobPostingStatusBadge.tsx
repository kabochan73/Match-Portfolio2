import { Badge } from "@/components/ui/Badge";
import type { Option } from "@/lib/api/types";

type JobPostingStatusBadgeProps = {
  status: Option;
};

/**
 * 求人の状態のバッジ。公開中だけ紺で目立たせ、下書き・募集終了は落ち着いた色にする
 */
export function JobPostingStatusBadge({ status }: JobPostingStatusBadgeProps) {
  return (
    <Badge tone={status.value === "published" ? "primary" : "muted"}>
      {status.label}
    </Badge>
  );
}
