"use client";

import { useEffect, useRef } from "react";

type WideMainProps = {
  /**
   * wide: 公開ページと同じ幅(7xl)に広げる(求人の詳細)。
   * full: 幅と余白の制限を外し、ページ側で公開ページと同じ枠を組む(端まで広がる帯がある企業ページ)
   */
  layout?: "wide" | "full";
};

/**
 * 置いたページを表示している間だけ、管理画面の<main>を広げる。
 * Cache Componentsでは、移動前のページが消えずに非表示のまま残る(Activity)ため、
 * 「中に目印があるか」をCSSで見ると、別のページに移っても広いままになる。
 * 非表示になると片付けられるEffectで、<main>の目印を付け外しする
 */
export function WideMain({ layout = "wide" }: WideMainProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const main = ref.current?.closest("main");
    main?.setAttribute("data-layout", layout);

    return () => main?.removeAttribute("data-layout");
  }, [layout]);

  return <span ref={ref} hidden />;
}
