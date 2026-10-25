import { describe, expect, it } from "vitest";

import type { Masters } from "@/lib/api/types";

import {
  jobsHref,
  KEYWORD_MAX_LENGTH,
  parseJobSearchParams,
} from "./searchParams";

const masters: Masters = {
  job_categories: [
    { id: 1, name: "バックエンド" },
    { id: 2, name: "フロントエンド" },
  ] as Masters["job_categories"],
  tech_stacks: [
    { id: 10, name: "PHP" },
    { id: 11, name: "Go" },
  ] as Masters["tech_stacks"],
  work_styles: [],
  prefectures: [
    { value: "tokyo", label: "東京" },
    { value: "remote", label: "リモート" },
  ],
  employment_types: [
    { value: "full_time", label: "正社員" },
    { value: "contract", label: "契約社員" },
  ],
};

describe("parseJobSearchParams", () => {
  it("reads every search condition from the URL", () => {
    expect(
      parseJobSearchParams(
        {
          category: "1",
          tech: ["10", "11"],
          location: "tokyo",
          type: ["full_time", "contract"],
          q: "  SaaS  ",
          sort: "popular",
          page: "3",
        },
        masters,
      ),
    ).toEqual({
      jobCategoryIds: [1],
      techStackIds: [10, 11],
      prefecture: "tokyo",
      employmentTypes: ["full_time", "contract"],
      keyword: "SaaS",
      sort: "popular",
      page: 3,
    });
  });

  it("uses the defaults for an empty URL", () => {
    expect(parseJobSearchParams({}, masters)).toEqual({
      jobCategoryIds: [],
      techStackIds: [],
      prefecture: undefined,
      employmentTypes: [],
      keyword: undefined,
      sort: "new",
      page: 1,
    });
  });

  // 手入力や古いリンクで変な値が来ても、検索がエラーにならないようにする
  it("drops values that are not in the masters or are not positive integers", () => {
    const params = parseJobSearchParams(
      {
        category: ["1", "999", "abc", "1.5", "0", "1"],
        tech: "-10",
        location: "mars",
        type: ["full_time", "unknown", "full_time"],
        sort: "oldest",
        page: "abc",
      },
      masters,
    );

    expect(params).toMatchObject({
      jobCategoryIds: [1],
      techStackIds: [],
      prefecture: undefined,
      employmentTypes: ["full_time"],
      sort: "new",
      page: 1,
    });
  });

  it("trims a keyword and cuts it to the maximum length", () => {
    const long = "あ".repeat(KEYWORD_MAX_LENGTH + 10);

    expect(parseJobSearchParams({ q: long }, masters).keyword).toHaveLength(
      KEYWORD_MAX_LENGTH,
    );
    expect(parseJobSearchParams({ q: "   " }, masters).keyword).toBeUndefined();
  });
});

describe("jobsHref", () => {
  it("builds the jobs URL from the conditions", () => {
    expect(
      jobsHref({
        jobCategoryIds: [1],
        techStackIds: [10, 11],
        prefecture: "tokyo",
        employmentTypes: ["full_time"],
        keyword: "SaaS",
        sort: "popular",
        page: 2,
      }),
    ).toBe(
      "/jobs?category=1&tech=10&tech=11&location=tokyo&type=full_time&q=SaaS&sort=popular&page=2",
    );
  });

  it("leaves out the defaults, so an empty search is just /jobs", () => {
    expect(jobsHref({ sort: "new", page: 1 })).toBe("/jobs");
  });

  it("returns to the same conditions when the URL is read again", () => {
    const params = parseJobSearchParams(
      { tech: ["10", "11"], q: "Go", sort: "popular", page: "2" },
      masters,
    );
    // 作ったURLのクエリを、page.tsxが受け取るsearchParamsと同じ形にする
    const { searchParams } = new URL(jobsHref(params), "https://example.com");
    const query = Object.fromEntries(
      [...new Set(searchParams.keys())].map((key) => [
        key,
        searchParams.getAll(key),
      ]),
    );

    expect(parseJobSearchParams(query, masters)).toEqual(params);
  });
});
