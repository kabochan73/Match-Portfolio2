type Step = {
  title: string;
  body: string;
};

type StepCardsProps = {
  steps: Step[];
};

/**
 * 使い方のステップ(STEP 01〜)。トップページは4ステップ、企業向けページは5ステップ
 */
export function StepCards({ steps }: StepCardsProps) {
  return (
    // PCではステップ数にかかわらず横1列に等幅で並べる
    <ol className="grid gap-5 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-col gap-3 border-2 border-primary bg-white p-6"
        >
          <span className="self-start bg-primary px-2.5 py-0.5 font-display text-xs font-bold tracking-widest text-white">
            STEP {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-black text-primary">{step.title}</h3>
          <p className="text-sm leading-relaxed text-ink-body">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
