import { describe, expect, it } from "vitest";

import {
  ageFromBirthDate,
  daysUntil,
  formatDateTime,
  formatMonthDay,
  formatYearMonth,
} from "./date";

describe("daysUntil", () => {
  const now = new Date("2026-10-25T00:00:00Z");

  it("counts the remaining days, rounding a partial day up", () => {
    expect(daysUntil("2026-11-01T00:00:00Z", now)).toBe(7);
    // 残り3時間でも「残り1日」にする(「残り0日」と出ているのに、まだ返事できる状態を避ける)
    expect(daysUntil("2026-10-25T03:00:00Z", now)).toBe(1);
  });

  it("returns 0 once the deadline has passed", () => {
    expect(daysUntil("2026-10-25T00:00:00Z", now)).toBe(0);
    expect(daysUntil("2026-10-20T00:00:00Z", now)).toBe(0);
  });
});

describe("ageFromBirthDate", () => {
  it("counts a year only after the birthday has come", () => {
    expect(ageFromBirthDate("1998-10-25", new Date(2026, 9, 25))).toBe(28);
    // 誕生日の前日までは1つ下
    expect(ageFromBirthDate("1998-10-26", new Date(2026, 9, 25))).toBe(27);
    expect(ageFromBirthDate("1998-11-01", new Date(2026, 9, 25))).toBe(27);
    expect(ageFromBirthDate("1998-01-31", new Date(2026, 9, 25))).toBe(28);
  });
});

describe("formatting in Japan time", () => {
  // APIの日時はUTCのため、日本時間では日付が1日進む時刻で確かめる
  const lateNightUtc = "2026-10-25T16:30:00Z";

  it("shows the month and day in Japan time", () => {
    expect(formatMonthDay(lateNightUtc)).toBe("10/26");
  });

  it("shows the date and time in Japan time", () => {
    expect(formatDateTime(lateNightUtc)).toBe("2026/10/26 01:30");
  });

  it("shows a year and month without a leading zero", () => {
    expect(formatYearMonth("2020-04")).toBe("2020年4月");
    expect(formatYearMonth("2021-12")).toBe("2021年12月");
  });
});
