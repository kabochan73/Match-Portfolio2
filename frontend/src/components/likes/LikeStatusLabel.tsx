import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { Option } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { daysUntil, formatMonthDay } from "@/lib/utils/date";

/** 残り何日から赤で知らせるか */
const URGENT_DAYS = 1;

type LikeStatusLabelProps = {
  /** 求職者のいいね・企業が受け取ったいいねの両方で使う */
  like: {
    status: Option;
    response_deadline: string;
    responded_at: string | null;
  };
};

/**
 * 応募の状況。反応待ちは返事の期限(残り日数と日付)、それ以外は結果と返事した日
 */
export function LikeStatusLabel({ like }: LikeStatusLabelProps) {
  if (like.status.value === "applied") {
    const days = daysUntil(like.response_deadline);
    const urgent = days <= URGENT_DAYS;

    return (
      <span
        className={cn(
          "flex items-center gap-1 text-xs font-bold",
          urgent ? "text-accent" : "text-ink-body",
        )}
      >
        <Clock className="size-3.5" aria-hidden />
        残り{days}日({formatMonthDay(like.response_deadline)}まで)
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-xs text-ink-sub">
      <Badge tone={like.status.value === "matched" ? "primary" : "muted"}>
        {like.status.label}
      </Badge>
      {like.responded_at && formatMonthDay(like.responded_at)}
    </span>
  );
}
