import type { Metadata } from "next";
import { Space_Grotesk, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

// 本文。日本語の文字はunicode-rangeで分割され、使う文字の分だけ読み込まれる
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku-gothic-new",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

// 英字・数字(ロゴ・見出しのラベル・金額など)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Match",
  description:
    "IT・エンジニア専門の求人マッチングサービス。いいねは月10回、企業は7日以内に必ず返事をくれます。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${zenKakuGothicNew.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
