type Feature = {
  title: string;
  body: string;
};

type FeatureCardsProps = {
  features: Feature[];
};

/**
 * 特徴の説明カード(01・02・03の番号付き)。トップページのコンセプト・企業向けページの特徴で使う
 */
export function FeatureCards({ features }: FeatureCardsProps) {
  return (
    <ul className="grid gap-7 md:grid-cols-3">
      {features.map((feature, index) => (
        <li
          key={feature.title}
          className="flex flex-col border-2 border-primary bg-white shadow-hard"
        >
          <div className="flex items-baseline gap-3.5 border-b-2 border-primary bg-tint px-6 py-4.5">
            <span className="font-display text-4xl leading-none font-bold text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-xl font-black text-primary">{feature.title}</h3>
          </div>
          <p className="px-6 pt-5 pb-6 text-sm leading-relaxed text-ink-body">
            {feature.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
