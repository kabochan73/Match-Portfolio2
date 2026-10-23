import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "マイページ | Tech Match",
};

// 仮: S-4(マイページ)でプロフィールの表示に置き換える
export default function MyPage() {
  return <h1 className="text-2xl font-black text-primary">マイページ</h1>;
}
