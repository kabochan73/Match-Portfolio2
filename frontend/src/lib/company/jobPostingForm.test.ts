import { describe, expect, it } from "vitest";

import type { CompanyJobPosting } from "@/lib/api/types";

import {
  emptyJobPostingValues,
  jobPostingSchema,
  toJobPostingFormField,
  toJobPostingFormValues,
  toJobPostingPayload,
} from "./jobPostingForm";

const validValues = {
  ...emptyJobPostingValues,
  title: "Laravelエンジニア",
  job_category_ids: [1],
  employment_type: "full_time",
  prefecture: "tokyo",
  salary_man: "45",
  description: "仕事内容",
  desired_candidate: "求める人材",
};

describe("salary in units of 10,000 yen", () => {
  it("accepts 10 to 200 with at most one decimal place", () => {
    for (const salary of ["10", "45", "45.5", "200"]) {
      expect(
        jobPostingSchema.safeParse({ ...validValues, salary_man: salary })
          .success,
      ).toBe(true);
    }
  });

  // 「35」と書くつもりで「350000」と円で書いてしまうなどの、桁の間違いを弾く
  it.each([["9.9"], ["201"], ["350000"], ["45.55"], ["四十五"], [""]])(
    "rejects %s",
    (salary) => {
      expect(
        jobPostingSchema.safeParse({ ...validValues, salary_man: salary })
          .success,
      ).toBe(false);
    },
  );

  it("sends the salary in yen and the selection steps as names", () => {
    expect(
      toJobPostingPayload({
        ...validValues,
        salary_man: "45.5",
        selection_steps: [{ name: "面談" }, { name: "面接" }],
      }),
    ).toMatchObject({ salary: 455000, selection_steps: ["面談", "面接"] });
  });

  it("does not leave a floating point error in yen", () => {
    // 0.1刻みの計算は誤差が出やすい(例: 56.7 * 10000 = 566999.9999...)
    expect(
      toJobPostingPayload({ ...validValues, salary_man: "56.7" }).salary,
    ).toBe(567000);
  });

  it("shows a saved salary back in units of 10,000 yen when editing", () => {
    const saved = {
      title: "求人",
      job_categories: [{ id: 1, name: "バックエンド" }],
      tech_stacks: [],
      employment_type: { value: "full_time", label: "正社員" },
      prefecture: { value: "tokyo", label: "東京" },
      salary: 455000,
      description: "仕事内容",
      desired_candidate: "求める人材",
      selection_steps: ["面談"],
    } as unknown as CompanyJobPosting;

    expect(toJobPostingFormValues(saved)).toMatchObject({
      salary_man: "45.5",
      job_category_ids: [1],
      selection_steps: [{ name: "面談" }],
    });
  });
});

describe("toJobPostingFormField", () => {
  it("maps server field names to the form's field names", () => {
    expect(toJobPostingFormField("salary")).toBe("salary_man");
    expect(toJobPostingFormField("selection_steps.1")).toBe(
      "selection_steps.1.name",
    );
    expect(toJobPostingFormField("job_category_ids.0")).toBe(
      "job_category_ids",
    );
    expect(toJobPostingFormField("title")).toBe("title");
  });
});
