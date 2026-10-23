"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { AvatarInput } from "@/components/images/AvatarInput";
import { buttonClass } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { FormSection } from "@/components/ui/FormSection";
import { UNEXPECTED_ERROR_MESSAGE } from "@/lib/forms/applyServerErrors";
import {
  seekerProfileQueryOptions,
  seekerQueryKeys,
} from "@/lib/seeker/queries";

import { BasicInfoForm } from "./BasicInfoForm";
import { SingleFieldItemsEditor } from "./SingleFieldItemsEditor";
import { WorkExperiencesEditor } from "./WorkExperiencesEditor";

/**
 * プロフィールの編集。アイコン・職歴・学歴・資格は、それぞれ操作した時点で保存する(基本情報だけ保存ボタンで送る)
 */
export function ProfileEditor() {
  const queryClient = useQueryClient();
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-body">
          いいねした企業に届くプロフィールです。履歴書・職務経歴書の代わりになります。
        </p>
        <Link href="/mypage" className={buttonClass({ variant: "secondary" })}>
          マイページで確認する
        </Link>
      </div>

      <FormSection title="アイコン">
        <AvatarInput
          imageUrl={profile.avatar_url}
          name={profile.name}
          path="/seeker/avatar"
          label="アイコン"
          onChanged={() =>
            queryClient.invalidateQueries({ queryKey: seekerQueryKeys.profile })
          }
        />
      </FormSection>

      <FormSection title="基本情報">
        <BasicInfoForm profile={profile} />
      </FormSection>

      <FormSection title="職歴">
        <WorkExperiencesEditor items={profile.work_experiences} />
      </FormSection>

      <FormSection title="学歴">
        <SingleFieldItemsEditor
          noun="学歴"
          label="学校名"
          placeholder="例: 東京情報大学 総合情報学部"
          field="school_name"
          endpoint="/seeker/educations"
          items={profile.educations.map(({ id, school_name }) => ({
            id,
            value: school_name,
          }))}
        />
      </FormSection>

      <FormSection title="資格">
        <SingleFieldItemsEditor
          noun="資格"
          label="資格名"
          placeholder="例: 基本情報技術者"
          field="name"
          endpoint="/seeker/certifications"
          items={profile.certifications.map(({ id, name }) => ({
            id,
            value: name,
          }))}
        />
      </FormSection>
    </div>
  );
}
