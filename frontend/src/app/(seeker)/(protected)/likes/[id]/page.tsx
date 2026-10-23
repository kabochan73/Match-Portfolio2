import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SeekerLikeDetail } from "@/components/seeker/SeekerLikeDetail";

export const metadata: Metadata = {
  title: "応募の詳細 | Tech Match",
};

/**
 * 応募の詳細。どの応募かはURLで決まるため、URLを読む部分を<Suspense>で囲む
 */
export default function LikePage({ params }: PageProps<"/likes/[id]">) {
  return (
    <Suspense>
      {params.then(({ id }) => {
        if (!/^[1-9]\d*$/.test(id)) {
          notFound();
        }

        return <SeekerLikeDetail id={Number(id)} />;
      })}
    </Suspense>
  );
}
