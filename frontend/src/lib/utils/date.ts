/** 日付は日本時間で表示する(APIの日時はUTC) */
const TIME_ZONE = "Asia/Tokyo";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 月/日(例: 10/30)
 */
export function formatMonthDay(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TIME_ZONE,
    month: "numeric",
    day: "numeric",
  }).format(new Date(iso));
}

/**
 * 年/月/日 時:分(例: 2026/10/30 14:05)
 */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * 期限までの残り日数(切り上げ。残り3時間なら1日、過ぎていれば0)
 */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.max(
    0,
    Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS),
  );
}

/**
 * 年月(YYYY-MM)を「2020年4月」と表示する(職歴の在籍期間など)
 */
export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");

  return `${year}年${Number(month)}月`;
}

/**
 * 生年月日(YYYY-MM-DD)から今の年齢を求める(誕生日の前日までは1つ下)
 */
export function ageFromBirthDate(
  birthDate: string,
  now: Date = new Date(),
): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  const hadBirthday =
    now.getMonth() + 1 > month ||
    (now.getMonth() + 1 === month && now.getDate() >= day);

  return now.getFullYear() - year - (hadBirthday ? 0 : 1);
}
