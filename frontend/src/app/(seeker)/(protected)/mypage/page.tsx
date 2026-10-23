import type { Metadata } from "next";

import { MyProfile } from "@/components/seeker/MyProfile";

export const metadata: Metadata = {
  title: "マイページ | Tech Match",
};

export default function MyPage() {
  return <MyProfile />;
}
