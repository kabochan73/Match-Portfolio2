"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import Link from "next/link";

import { ApplicantProfile } from "@/components/profile/ApplicantProfile";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";
import { seekerProfileQueryOptions } from "@/lib/seeker/queries";
import { ageFromBirthDate } from "@/lib/utils/date";

/**
 * マイページ。企業が応募者詳細で見るのと同じ形で、自分のプロフィールを表示する
 */
export function MyProfile() {
  const {
    data: profile,
    isPending,
    isError,
  } = useQuery(seekerProfileQueryOptions());

  if (isPending) {
    return (
      <div className="h-96 animate-pulse border-2 border-primary/30 bg-white" />
    );
  }

  if (isError) {
    return <FormAlert message={UNEXPECTED_ERROR_MESSAGE} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center gap-5">
        <Avatar src={profile.avatar_url} name={profile.name} size={80} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-black text-primary">
            {profile.name}
            <span className="ml-2 text-base font-bold text-ink-sub">
              ({ageFromBirthDate(profile.birth_date)}歳)
            </span>
          </h1>
          <p className="text-sm text-ink-sub">{profile.email}</p>
        </div>
        <Link
          href="/mypage/edit"
          className={buttonClass({ variant: "secondary" })}
        >
          <Pencil className="size-4" aria-hidden />
          プロフィールを編集
        </Link>
      </header>

      <p className="border-2 border-dashed border-line-soft bg-white px-4 py-3 text-sm text-ink-body">
        いいねした企業には、このプロフィールと志望動機が届きます(生年月日は年齢だけ、メールアドレスはマッチしたあとに表示されます)。
      </p>

      <ApplicantProfile
        applicant={{
          ...profile,
          age: ageFromBirthDate(profile.birth_date),
        }}
      />
    </div>
  );
}
