import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, TagCheckbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { TextInput } from "@/components/ui/TextInput";
import type { Masters } from "@/lib/api/types";
import type { JobSearchParams } from "@/lib/jobs/api";
import { JOB_SEARCH_QUERY, KEYWORD_MAX_LENGTH } from "@/lib/jobs/searchParams";
import { cn } from "@/lib/utils/cn";

type SearchSidebarProps = {
  masters: Masters;
  /** 今の検索条件。入力欄の初期値にする */
  params: JobSearchParams;
};

/**
 * 求人一覧の検索条件。送信するとGETで/jobs?category=1&tech=3...に移動する(Next.jsの<Form>でページ遷移はクライアント側)。
 * PCでは常に開いたサイドバー、スマホでは押して開く折りたたみにする
 */
export function SearchSidebar({ masters, params }: SearchSidebarProps) {
  const conditionCount =
    (params.jobCategoryIds?.length ?? 0) +
    (params.techStackIds?.length ?? 0) +
    (params.employmentTypes?.length ?? 0) +
    (params.prefecture ? 1 : 0) +
    (params.keyword ? 1 : 0);
  // 並び順は検索条件ではないため、クリアしても残す
  const clearHref =
    params.sort === "popular"
      ? `/jobs?${JOB_SEARCH_QUERY.sort}=popular`
      : "/jobs";

  return (
    <Card>
      {/* PCでは閉じていても中身を表示する(::details-contentの非表示を打ち消す) */}
      <details className="group/filters lg:details-content:h-auto lg:details-content:[content-visibility:visible]">
        <summary className="flex cursor-pointer list-none items-center justify-between bg-tint px-5 py-4 font-bold text-primary lg:hidden">
          <span>
            検索条件で絞り込む
            {conditionCount > 0 && (
              <span className="ml-2 bg-primary px-1.5 py-0.5 font-display text-xs text-white">
                {conditionCount}
              </span>
            )}
          </span>
          <Chevron className="group-open/filters:rotate-[225deg]" />
        </summary>

        <div className="hidden items-center justify-between border-b-2 border-primary bg-tint px-5 py-4 lg:flex">
          <h2 className="font-bold text-primary">検索条件</h2>
          <Link
            href={clearHref}
            className="text-xs font-bold text-primary underline underline-offset-4"
          >
            クリア
          </Link>
        </div>

        {/* URLが変わったら(戻る・クリアなど)入力欄を作り直し、今の条件を初期値として反映する */}
        <Form
          key={JSON.stringify(params)}
          action="/jobs"
          className="flex flex-col gap-6 border-t-2 border-primary px-5 py-5 lg:border-t-0"
        >
          {params.sort === "popular" && (
            <input type="hidden" name={JOB_SEARCH_QUERY.sort} value="popular" />
          )}

          <Field label="キーワード" htmlFor="job-search-keyword">
            <TextInput
              id="job-search-keyword"
              name={JOB_SEARCH_QUERY.keyword}
              type="search"
              defaultValue={params.keyword}
              maxLength={KEYWORD_MAX_LENGTH}
              placeholder="例: 自社開発 SaaS"
            />
          </Field>

          <Field label="技術スタック">
            <GroupedOptions
              items={masters.tech_stacks}
              selectedIds={params.techStackIds ?? []}
              renderItems={(items) => (
                <div className="flex flex-wrap gap-1.5 pt-1 pb-2">
                  {items.map((techStack) => (
                    <TagCheckbox
                      key={techStack.id}
                      name={JOB_SEARCH_QUERY.techStack}
                      value={techStack.id}
                      defaultChecked={params.techStackIds?.includes(
                        techStack.id,
                      )}
                      label={techStack.name}
                    />
                  ))}
                </div>
              )}
            />
          </Field>

          <Field label="職種">
            <GroupedOptions
              items={masters.job_categories}
              selectedIds={params.jobCategoryIds ?? []}
              renderItems={(items) => (
                <div className="pb-1">
                  {items.map((jobCategory) => (
                    <Checkbox
                      key={jobCategory.id}
                      name={JOB_SEARCH_QUERY.jobCategory}
                      value={jobCategory.id}
                      defaultChecked={params.jobCategoryIds?.includes(
                        jobCategory.id,
                      )}
                      label={jobCategory.name}
                    />
                  ))}
                </div>
              )}
            />
          </Field>

          <Field label="勤務地" htmlFor="job-search-location">
            <Select
              id="job-search-location"
              name={JOB_SEARCH_QUERY.location}
              defaultValue={params.prefecture ?? ""}
            >
              <option value="">指定なし</option>
              {masters.prefectures.map((prefecture) => (
                <option key={prefecture.value} value={prefecture.value}>
                  {prefecture.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="雇用形態">
            <div>
              {masters.employment_types.map((employmentType) => (
                <Checkbox
                  key={employmentType.value}
                  name={JOB_SEARCH_QUERY.employmentType}
                  value={employmentType.value}
                  defaultChecked={params.employmentTypes?.includes(
                    employmentType.value,
                  )}
                  label={employmentType.label}
                />
              ))}
            </div>
          </Field>

          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" withShadow className="w-full">
              この条件で検索
            </Button>
            <Link
              href={clearHref}
              className="self-center py-2 text-xs font-bold text-primary underline underline-offset-4 lg:hidden"
            >
              条件をクリア
            </Link>
          </div>
        </Form>
      </details>
    </Card>
  );
}

type FieldProps = {
  label: string;
  /** 入力欄が1つのときはラベルと結び付ける。チェックボックスの集まりは<fieldset>にする */
  htmlFor?: string;
  children: ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
  const labelClass = "mb-2 block text-sm font-bold text-ink";

  if (htmlFor) {
    return (
      <div>
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
        {children}
      </div>
    );
  }

  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      {children}
    </fieldset>
  );
}

type GroupedItem = {
  id: number;
  group_name: string;
};

type GroupedOptionsProps<T extends GroupedItem> = {
  items: T[];
  selectedIds: number[];
  renderItems: (items: T[]) => ReactNode;
};

/**
 * 選択肢を分類(group_name)ごとの折りたたみに分ける。
 * 選択肢が多い(技術スタック46・職種25)ため、最初の分類と、選択中のものがある分類だけを開いておく
 */
function GroupedOptions<T extends GroupedItem>({
  items,
  selectedIds,
  renderItems,
}: GroupedOptionsProps<T>) {
  const groups = Map.groupBy(items, (item) => item.group_name);

  return (
    <div className="border-t border-primary/20">
      {[...groups].map(([groupName, groupItems], index) => {
        const selectedCount = groupItems.filter((item) =>
          selectedIds.includes(item.id),
        ).length;

        return (
          <details
            key={groupName}
            open={index === 0 || selectedCount > 0}
            className="group border-b border-primary/20"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-xs font-bold text-ink-sub">
              <span>
                {groupName}
                {selectedCount > 0 && (
                  <span className="ml-1.5 text-primary">({selectedCount})</span>
                )}
              </span>
              <Chevron className="group-open:rotate-[225deg]" />
            </summary>
            {renderItems(groupItems)}
          </details>
        );
      })}
    </div>
  );
}

/** 折りたたみの開閉を示す矢印(下向き。開くと上向きに回す) */
function Chevron({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mr-1 size-2 -translate-y-0.5 rotate-45 border-r-2 border-b-2 border-primary transition-transform",
        className,
      )}
    />
  );
}
