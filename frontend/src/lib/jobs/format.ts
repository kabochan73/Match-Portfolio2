/**
 * 月給(円)を万円単位で表示する
 *
 * @example formatSalary(350000) // "35万"
 * @example formatSalary(355000) // "35.5万"
 */
export function formatSalary(salary: number): string {
  const man = (salary / 10000).toLocaleString("ja-JP", {
    maximumFractionDigits: 1,
  });

  return `${man}万`;
}
