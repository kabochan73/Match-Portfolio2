import { describe, expect, it } from "vitest";

import { formatSalary } from "./format";

describe("formatSalary", () => {
  it("shows a monthly salary in units of 10,000 yen", () => {
    expect(formatSalary(350000)).toBe("35万");
    expect(formatSalary(355000)).toBe("35.5万");
  });

  it("keeps one decimal place at most and adds a thousands separator", () => {
    expect(formatSalary(123456)).toBe("12.3万");
    expect(formatSalary(20000000)).toBe("2,000万");
  });
});
