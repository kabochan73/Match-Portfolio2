import { TagCheckbox } from "./Checkbox";

type TagItem = {
  id: number;
  name: string;
  group_name?: string;
};

type TagPickerProps = {
  items: TagItem[];
  /** 選んでいるID */
  value: number[];
  onChange: (value: number[]) => void;
  /** 選べる数の上限。達したら、選んでいないタグは押せなくする */
  max: number;
  /** フォームの項目名(チェックボックスのname) */
  name: string;
};

/**
 * タグの見た目で複数選ぶ入力(職種・技術スタックなど)。分類(group_name)があれば、分類ごとに見出しを付けて並べる
 */
export function TagPicker({
  items,
  value,
  onChange,
  max,
  name,
}: TagPickerProps) {
  const groups = Map.groupBy(items, (item) => item.group_name ?? "");
  const isFull = value.length >= max;

  const toggle = (id: number, checked: boolean) => {
    onChange(checked ? [...value, id] : value.filter((v) => v !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      {[...groups].map(([groupName, groupItems]) => (
        <div key={groupName} className="flex flex-col gap-1.5">
          {groupName && (
            <p className="text-xs font-bold text-ink-sub">{groupName}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {groupItems.map((item) => {
              const checked = value.includes(item.id);

              return (
                <TagCheckbox
                  key={item.id}
                  name={name}
                  value={item.id}
                  label={item.name}
                  checked={checked}
                  disabled={!checked && isFull}
                  onChange={(event) => toggle(item.id, event.target.checked)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
