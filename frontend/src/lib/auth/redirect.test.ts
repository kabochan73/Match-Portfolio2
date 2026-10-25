import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./redirect";

describe("safeRedirectPath", () => {
  it("uses a path inside this site", () => {
    expect(safeRedirectPath("/jobs/12", "/jobs")).toBe("/jobs/12");
    expect(safeRedirectPath("/jobs?tech=1&page=2", "/jobs")).toBe(
      "/jobs?tech=1&page=2",
    );
  });

  it("falls back when there is no redirect", () => {
    expect(safeRedirectPath(null, "/jobs")).toBe("/jobs");
    expect(safeRedirectPath("", "/jobs")).toBe("/jobs");
  });

  // 外部のサイトへ移動させる偽のリンク(オープンリダイレクト)を防ぐ
  it.each([
    ["https://evil.example.com"],
    ["//evil.example.com"],
    ["/\\evil.example.com"],
    ["javascript:alert(1)"],
    ["jobs/12"],
  ])("falls back for %s, which could leave this site", (redirect) => {
    expect(safeRedirectPath(redirect, "/jobs")).toBe("/jobs");
  });
});
