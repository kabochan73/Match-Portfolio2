import { cn } from "@/lib/utils/cn";

type SelectionStepsProps = {
  steps: string[];
};

/**
 * 選考フロー(1〜6ステップ)。番号付きの四角を縦の線でつなぎ、順番に進むことが分かるようにする
 */
export function SelectionSteps({ steps }: SelectionStepsProps) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex size-9 shrink-0 items-center justify-center border-2 border-primary bg-primary font-display text-sm font-bold text-white">
              {index + 1}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden className="w-0.5 flex-1 bg-primary" />
            )}
          </div>
          {/* 最後のステップ以外は、次の番号との間をあける */}
          <p
            className={cn(
              "pt-1.5 font-bold text-ink",
              index < steps.length - 1 && "pb-6",
            )}
          >
            {step}
          </p>
        </li>
      ))}
    </ol>
  );
}
