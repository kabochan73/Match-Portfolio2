"use client";

import { useEffect, useRef } from "react";

/**
 * 置いたページを表示している間だけ、管理画面の<main>を公開ページと同じ幅に広げる。
 * Cache Componentsでは、移動前のページが消えずに非表示のまま残る(Activity)ため、
 * 「中に目印があるか」をCSSで見ると、別のページに移っても広いままになる。
 * 非表示になると片付けられるEffectで、<main>の目印を付け外しする
 */
export function WideMain() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const main = ref.current?.closest("main");
    main?.setAttribute("data-layout", "wide");

    return () => main?.removeAttribute("data-layout");
  }, []);

  return <span ref={ref} hidden />;
}
