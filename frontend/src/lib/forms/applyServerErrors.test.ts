import { describe, expect, it, vi } from "vitest";

import { ApiError, ValidationError } from "@/lib/api/errors";

import {
  applyServerErrors,
  errorMessage,
  UNEXPECTED_ERROR_MESSAGE,
} from "./applyServerErrors";

type Values = { email: string; password: string };

describe("applyServerErrors", () => {
  it("shows each 422 message under its field, using the first message", () => {
    const setError = vi.fn();

    applyServerErrors<Values>(
      new ValidationError("入力エラー", {
        email: ["メールアドレスは必須です。", "形式が違います。"],
        password: ["パスワードは必須です。"],
      }),
      setError,
      ["email", "password"],
    );

    expect(setError).toHaveBeenCalledWith("email", {
      message: "メールアドレスは必須です。",
    });
    expect(setError).toHaveBeenCalledWith("password", {
      message: "パスワードは必須です。",
    });
  });

  it("shows a message for a field the form does not have at the top of the form", () => {
    const setError = vi.fn();

    applyServerErrors<Values>(
      new ValidationError("入力エラー", {
        like_type: ["今月のいいねは上限に達しています。"],
      }),
      setError,
      ["email", "password"],
    );

    expect(setError).toHaveBeenCalledWith("root", {
      message: "今月のいいねは上限に達しています。",
    });
  });

  it("uses the field name mapping for server names that differ from the form", () => {
    const setError = vi.fn();

    applyServerErrors(
      new ValidationError("入力エラー", { salary: ["月給が範囲外です。"] }),
      setError,
      ["salary_man"],
      (serverField) => (serverField === "salary" ? "salary_man" : serverField),
    );

    expect(setError).toHaveBeenCalledWith("salary_man", {
      message: "月給が範囲外です。",
    });
  });

  it("shows a general message for errors other than 422", () => {
    const setError = vi.fn();

    applyServerErrors<Values>(new ApiError(500, "サーバーエラー"), setError, [
      "email",
    ]);
    applyServerErrors<Values>(new TypeError("Failed to fetch"), setError, [
      "email",
    ]);

    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenNthCalledWith(1, "root", {
      message: UNEXPECTED_ERROR_MESSAGE,
    });
  });
});

describe("errorMessage", () => {
  it("returns the first 422 message, or a general message otherwise", () => {
    expect(
      errorMessage(
        new ValidationError("入力エラー", {
          status: ["公開中の求人は10件までです。"],
        }),
      ),
    ).toBe("公開中の求人は10件までです。");
    expect(errorMessage(new ApiError(500, "エラー"))).toBe(
      UNEXPECTED_ERROR_MESSAGE,
    );
  });
});
