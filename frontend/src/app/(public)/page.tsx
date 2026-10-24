import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { FeatureCards } from "@/components/landing/FeatureCards";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { StepCards } from "@/components/landing/StepCards";
import {
  TechStackLinks,
  TechStackLinksSkeleton,
} from "@/components/landing/TechStackLinks";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const FEATURES = [
  {
    title: "すぐ返答",
    body: "企業は7日以内に「気になる」か「見送り」を返します。期限を過ぎれば自動で不成立に。結果が来ないまま待ち続ける、サイレントお祈りはありません。",
  },
  {
    title: "書類不要",
    body: "一度作ったプロフィールが、履歴書と職務経歴書の代わりになります。応募のたびに書くのは、その企業への志望動機だけ。",
  },
  {
    title: "志望動機で勝負",
    body: "いいねの際、一緒に志望動機を送れます。限られたいいねと志望動機で、企業に本気度を伝えましょう！",
  },
];

const STEPS = [
  {
    title: "プロフィールを作る",
    body: "自己紹介・職歴・学歴・資格・ポートフォリオのURLを登録します。",
  },
  {
    title: "求人を探す",
    body: "職種・技術スタック・勤務地などで、気になる求人を絞り込みます。",
  },
  {
    title: "志望動機を書いていいね",
    body: "いいねが応募になります。ここぞという求人には、スーパーいいね。",
  },
  {
    title: "7日以内に結果が届く",
    body: "マッチしたら、企業から登録したメールアドレスに連絡が届きます。",
  },
];

const NOTES = [
  "企業からのスカウトはありません",
  "いいねの購入はできません",
  "いいねは毎月1日に回復します",
];

/**
 * トップページ(求職者向け)。技術スタックの一覧以外は静的な骨組みとして配信する
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="CONCEPT"
            description="Tech Matchでは、求職者の「いいね」がそのまま応募になります。採用の可能性が低い相手に時間を使わずに済むから、転職活動も採用活動も、もっと効率的に。"
          >
            採用のミスマッチを防ぐ
          </SectionHeading>
          <FeatureCards features={FEATURES} />
          <ul className="flex flex-wrap gap-x-8 gap-y-2 border-2 border-dashed border-line-soft bg-page px-6 py-4.5 text-sm font-bold text-ink-body">
            {NOTES.map((note) => (
              <li key={note}>※ {note}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y-2 border-primary bg-page">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading eyebrow="HOW TO USE">
            使い方は、4ステップ。
          </SectionHeading>
          <StepCards steps={STEPS} />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 sm:py-22">
          <SectionHeading eyebrow="TECH STACK">
            技術スタックから探す
          </SectionHeading>
          <Suspense fallback={<TechStackLinksSkeleton />}>
            <TechStackLinks />
          </Suspense>
        </div>
      </section>

      <section className="border-t-2 border-primary bg-primary text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-20 sm:px-6 sm:py-22">
          <div className="flex flex-col gap-3">
            <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-snug font-black">
              まずは、プロフィールを作ろう。
            </h2>
            <p className="font-medium text-tint-strong">
              一度作れば、どの求人にも志望動機だけで応募できます。
            </p>
          </div>
          <Link
            href="/register"
            className={cn(
              buttonClass({ variant: "accent", size: "lg" }),
              "h-15 border-white px-8 text-lg font-black shadow-[5px_5px_0_var(--color-tint-strong)]",
            )}
          >
            無料で会員登録
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

function Hero() {
  return (
    <section className="border-b-2 border-primary bg-tint-strong">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-4 pt-16 pb-20 sm:px-6 sm:pt-18">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col items-start gap-6">
          <p className="bg-primary px-3 py-1 text-[20px] font-bold tracking-wider text-white">
            IT・エンジニア専門の求人マッチング
          </p>
          <h1 className="text-[clamp(2.375rem,5vw,3.875rem)] leading-tight font-black text-primary">
            いいねを一次面接に
          </h1>
          <p className="max-w-130 leading-relaxed font-medium text-ink-body">
            プロフィールを一度作れば、それが経歴書に。
            <br />
            必ず7日以内に結果がわかるから、待ち続けることも無し
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/jobs"
              className={cn(
                buttonClass({ size: "lg" }),
                "font-black shadow-[5px_5px_0_white]",
              )}
            >
              求人を探す
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonClass({ variant: "secondary", size: "lg" }),
                "font-black shadow-[5px_5px_0_var(--color-primary)]",
              )}
            >
              無料で会員登録
            </Link>
          </div>
        </div>

        <div className="relative min-w-0 flex-[1_1_420px] pr-3 pb-3">
          <div className="overflow-hidden border-2 border-primary bg-white shadow-[12px_12px_0_var(--color-primary)]">
            <Image
              src="/hero.webp"
              width={1600}
              height={1067}
              alt="ノートPCを持って笑顔で立つ女性"
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-80 w-full object-cover object-[70%_20%] sm:h-110"
              preload
            />
          </div>
          {/* 写真に重ねる吹き出し。サービスのいちばんの約束を目立たせる */}
          <div className="absolute bottom-10 -left-2 flex items-center gap-3 border-2 border-primary bg-white px-4.5 py-3.5 shadow-[5px_5px_0_var(--color-accent)] sm:-left-5">
            <span className="flex size-10 items-center justify-center bg-accent text-white">
              <Clock className="size-5.5" aria-hidden />
            </span>
            <span className="flex flex-col leading-snug">
              <span className="text-xs font-bold text-ink-sub">
                サイレントお祈りなし
              </span>
              <span className="text-[17px] font-black text-primary">
                7日以内に必ず結果
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
