import { ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FeatureCards } from "@/components/landing/FeatureCards";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { StepCards } from "@/components/landing/StepCards";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "企業の方へ | Tech Match",
  description:
    "求職者のいいねは月5回まで。届く応募には必ず志望動機が添えられています。掲載は無料、登録時の審査もありません。",
};

const FEATURES = [
  {
    title: "応募の質が高い",
    body: "求職者のいいねは月5回まで。数が限られているので、本当に興味を持った企業にだけ応募が届きます。スーパーいいねなら、さらに強い熱意の印です。",
  },
  {
    title: "伝わる企業ページ",
    body: "事業内容だけでなく、カルチャー・技術スタック・働き方・写真まで載せられます。条件ではなく、中身で選ばれる企業ページを作れます。",
  },
  {
    title: "無料・審査なし",
    body: "掲載料はかかりません。登録時の審査もないので、アカウントを作ったその日から求人を公開できます。",
  },
];

const STEPS = [
  {
    title: "無料で登録",
    body: "会社名・メールアドレス・パスワードを入力します。",
  },
  {
    title: "企業ページを作る",
    body: "事業内容やカルチャー、技術スタック、写真を登録します。",
  },
  { title: "求人を公開", body: "同時に10件まで公開できます。" },
  {
    title: "7日以内に返答",
    body: "届いた応募に「気になる」か「見送り」を返します。",
  },
  {
    title: "メールで連絡",
    body: "マッチしたら求職者のメールアドレスが表示されます。",
  },
];

const RULES = [
  "同時に公開できる求人は10件までです(下書き・募集終了は含みません)",
  "マッチ後の連絡は、求職者の登録メールアドレス宛にお送りください",
  "掲載は無料です。登録時の審査もありません",
];

/**
 * 企業向けページ。中身はすべて固定の文章のため、ページ全体を静的に配信する
 */
export default function ForCompaniesPage() {
  return (
    <>
      <Hero />

      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading eyebrow="FEATURES">
            Tech Matchで採用する理由
          </SectionHeading>
          <FeatureCards features={FEATURES} />
        </div>
      </section>

      <section className="border-y-2 border-primary bg-page">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading eyebrow="HOW TO USE">
            掲載から採用までの流れ
          </SectionHeading>
          <StepCards steps={STEPS} />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="border-2 border-accent bg-white shadow-[8px_8px_0_var(--color-accent)]">
            <h2 className="flex items-center gap-3 bg-accent px-7 py-3.5 text-lg font-black text-white">
              <Clock className="size-5.5" aria-hidden />
              掲載にあたってのお約束
            </h2>
            <div className="flex flex-col gap-5 p-7">
              <p className="text-[17px] font-black text-primary">
                応募には、7日以内に「気になる」か「見送り」を返してください。
              </p>
              <p className="leading-relaxed text-ink-body">
                期限を過ぎた応募は自動で不成立になり、求職者に結果が通知されます。求職者を待たせないことが、このサービスのいちばん大切なルールです。
              </p>
              <ul className="flex flex-col gap-1.5 border-2 border-dashed border-line-soft bg-page px-6 py-4.5 text-sm font-bold text-ink-body">
                {RULES.map((rule) => (
                  <li key={rule}>・{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-primary bg-primary text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-20 sm:px-6 sm:py-22">
          <div className="flex flex-col gap-3">
            <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-snug font-black">
              企業ページを作って、
              <br />
              最初の求人を公開しよう。
            </h2>
            <p className="font-medium text-tint-strong">
              登録は会社名・メールアドレス・パスワードだけ。すぐに始められます。
            </p>
          </div>
          <RegisterLink />
        </div>
      </section>
    </>
  );
}

/** 紺の背景の上に置く、赤い「無料で掲載をはじめる」ボタン(ヒーロー・CTAで共通) */
function RegisterLink() {
  return (
    <Link
      href="/company/register"
      className={cn(
        buttonClass({ variant: "accent", size: "lg" }),
        "border-white font-black shadow-[5px_5px_0_var(--color-tint-strong)]",
      )}
    >
      無料で掲載をはじめる
      <ArrowRight className="size-5" aria-hidden />
    </Link>
  );
}

function Hero() {
  return (
    <section className="border-b-2 border-primary bg-primary text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-4 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-22">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col items-start gap-6">
          <p className="bg-tint-strong px-3 py-1 text-[13px] font-bold tracking-wider text-primary">
            採用担当者の方へ
          </p>
          <h1 className="text-[clamp(2.375rem,5vw,3.75rem)] leading-tight font-black">
            本気の応募だけが、
            <br />
            届く。
          </h1>
          <p className="max-w-135 leading-relaxed font-medium text-tint-strong">
            求職者のいいねは月5回まで。届く応募には、必ずその企業のために書かれた志望動機が添えられています。
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <RegisterLink />
            <Link
              href="/company/login"
              className={cn(
                buttonClass({ size: "lg" }),
                "border-white bg-transparent font-black hover:bg-white/10",
              )}
            >
              企業ログイン
            </Link>
          </div>
        </div>

        <ApplicantsPreview />
      </div>
    </section>
  );
}

const SAMPLE_APPLICANTS = [
  {
    initial: "山",
    name: "山田 太郎(26)",
    isSuper: true,
    daysLeft: 2,
    motivation:
      "貴社の決済基盤の設計思想に共感し、APIの信頼性を高める仕事に挑戦したいと考え…",
  },
  {
    initial: "佐",
    name: "佐藤 花子(31)",
    isSuper: false,
    daysLeft: 5,
    motivation:
      "Laravelでの業務システム開発を5年経験し、自社サービスの成長に関わりたく…",
  },
];

/**
 * ヒーローに置く応募者一覧の見本(固定のサンプル)。届く応募のイメージを見せるためのもので、ボタンは押せない
 */
function ApplicantsPreview() {
  return (
    <div
      aria-hidden
      className="min-w-0 flex-[1_1_400px] border-2 border-white bg-white text-ink shadow-[10px_10px_0_var(--color-line-soft)]"
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-primary bg-tint px-4.5 py-2.5">
        <span className="text-sm font-black text-primary">
          応募者一覧 ・ 反応待ち
        </span>
        <span className="font-display text-xs font-bold text-primary">
          {SAMPLE_APPLICANTS.length}件
        </span>
      </div>
      {SAMPLE_APPLICANTS.map((applicant) => (
        <div
          key={applicant.name}
          className="flex flex-col gap-2.5 border-b-2 border-tint px-4.5 py-4 last:border-b-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap items-center gap-2.5">
              <span className="flex size-8.5 items-center justify-center border-2 border-primary bg-tint text-[13px] font-black text-primary">
                {applicant.initial}
              </span>
              <span className="font-black text-primary">{applicant.name}</span>
              {applicant.isSuper && (
                <span className="bg-accent px-2 py-px text-[11px] font-bold text-white">
                  スーパーいいね
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-accent">
              残り {applicant.daysLeft}日
            </span>
          </div>
          <p className="text-[13px] text-ink-body">{applicant.motivation}</p>
          <div className="flex justify-end gap-2">
            <span className="inline-flex h-8.5 items-center border-2 border-primary px-3.5 text-[13px] font-bold text-primary">
              見送り
            </span>
            <span className="inline-flex h-8.5 items-center border-2 border-primary bg-primary px-3.5 text-[13px] font-bold text-white">
              気になる
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
