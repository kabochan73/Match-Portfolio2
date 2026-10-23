import type { Metadata } from "next";

import { ProfileEditor } from "@/components/seeker/ProfileEditor";

export const metadata: Metadata = {
  title: "プロフィール編集 | Tech Match",
};

export default function ProfileEditPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black text-primary">プロフィール編集</h1>
      <ProfileEditor />
    </div>
  );
}
