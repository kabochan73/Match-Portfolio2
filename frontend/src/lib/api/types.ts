/**
 * Laravel APIの返り値の型。backend/app/Http/Resources の各リソースと対応させる
 */

/** enumの選択肢(都道府県・雇用形態・求人の状態など) */
export type Option = {
  value: string;
  label: string;
};

export type JobCategory = {
  id: number;
  name: string;
  group_name: string;
};

export type TechStack = {
  id: number;
  name: string;
  group_name: string;
};

export type WorkStyle = {
  id: number;
  name: string;
};

export type Image = {
  id: number;
  url: string;
};

/** GET /api/masters */
export type Masters = {
  job_categories: JobCategory[];
  tech_stacks: TechStack[];
  work_styles: WorkStyle[];
  prefectures: Option[];
  employment_types: Option[];
};

/** ログイン中の求職者本人(UserResource)。本人にだけ返すため、メールアドレス・生年月日を含む */
export type Seeker = {
  id: number;
  name: string;
  email: string;
  comment: string | null;
  portfolio_url: string | null;
  /** YYYY-MM-DD */
  birth_date: string;
  avatar_url: string | null;
};

/** 求人カードに添える会社(CompanySummaryResource) */
export type CompanySummary = {
  id: number;
  name: string;
  avatar_url: string | null;
};

/** 求人カード(JobPostingSummaryResource) */
export type JobPostingSummary = {
  id: number;
  title: string;
  /** 企業ページの募集中の求人では含まれない */
  company?: CompanySummary;
  job_categories: JobCategory[];
  tech_stacks: TechStack[];
  prefecture: Option;
  employment_type: Option;
  /** 月給(円) */
  salary: number;
  likes_count: number;
  is_new: boolean;
  cover_image_url: string | null;
  published_at: string | null;
};

/** 求職者に見せる企業(PublicCompanyResource)。メールアドレスは含まれない */
export type PublicCompany = {
  id: number;
  name: string;
  avatar_url: string | null;
  introduction: string | null;
  business_description: string | null;
  culture: string | null;
  founded_year: number | null;
  member_count: number | null;
  prefecture: Option | null;
  address_line: string | null;
  website_url: string | null;
  /** 企業ページ(GET /api/companies/{id})でのみ含まれる */
  tech_stacks?: TechStack[];
  work_styles?: WorkStyle[];
  images?: Image[];
  job_postings?: JobPostingSummary[];
};

/** ログイン中の企業本人(CompanyResource)。公開用と違い、メールアドレスを含む */
export type Company = PublicCompany & {
  email: string;
};

/** 求人詳細(GET /api/jobs/{id}) */
export type JobPostingDetail = {
  id: number;
  title: string;
  description: string;
  desired_candidate: string;
  employment_type: Option;
  prefecture: Option;
  /** 月給(円) */
  salary: number;
  selection_steps: string[];
  status: Option;
  published_at: string | null;
  is_new: boolean;
  updated_at: string;
  job_categories: JobCategory[];
  tech_stacks: TechStack[];
  images: Image[];
  likes_count: number;
  company: PublicCompany;
};

/** 企業が管理する自社の求人(JobPostingResource。/api/company/job-postings) */
export type CompanyJobPosting = {
  id: number;
  title: string;
  description: string;
  desired_candidate: string;
  employment_type: Option;
  prefecture: Option;
  /** 月給(円) */
  salary: number;
  selection_steps: string[];
  /** draft(下書き) / published(公開中) / closed(募集終了) */
  status: Option;
  published_at: string | null;
  is_new: boolean;
  updated_at: string;
  job_categories: JobCategory[];
  /** 詳細でのみ含まれる */
  tech_stacks?: TechStack[];
  images?: Image[];
  likes_count: number;
  /** 企業の返事を待っている応募の数 */
  pending_likes_count: number;
};

/** 求人管理の一覧(GET /api/company/job-postings) */
export type CompanyJobPostingList = {
  data: CompanyJobPosting[];
  meta: {
    published_count: number;
    max_published: number;
  };
};

/** 職歴(WorkExperienceResource) */
export type WorkExperience = {
  id: number;
  company_name: string;
  /** YYYY-MM */
  started_on: string;
  /** YYYY-MM。nullなら在籍中 */
  ended_on: string | null;
  employment_type: Option;
};

/** 学歴(EducationResource) */
export type Education = {
  id: number;
  school_name: string;
};

/** 資格(CertificationResource) */
export type Certification = {
  id: number;
  name: string;
};

/** 企業に見せる応募者(ApplicantResource)。生年月日ではなく年齢で、メールアドレスはマッチ後だけ含まれる */
export type Applicant = {
  id: number;
  name: string;
  age: number;
  avatar_url: string | null;
  comment: string | null;
  portfolio_url: string | null;
  email?: string;
  /** 応募者の詳細でのみ含まれる */
  work_experiences?: WorkExperience[];
  educations?: Education[];
  certifications?: Certification[];
};

/** いいね(応募)のタブ。不成立は見送りと期限切れの両方 */
export type LikeTab = "applied" | "matched" | "unsuccessful";

/** 企業が受け取ったいいね(ReceivedLikeResource) */
export type ReceivedLike = {
  id: number;
  /** standard(いいね) / super(スーパーいいね) */
  like_type: Option;
  /** applied / matched / declined / expired */
  status: Option;
  motivation: string;
  response_deadline: string;
  responded_at: string | null;
  created_at: string;
  job_posting: { id: number; title: string };
  applicant: Applicant;
};

/** 応募者一覧(GET /api/company/likes)。タブごとの件数を含む */
export type ReceivedLikeList = Paginated<ReceivedLike> & {
  meta: { counts: Record<LikeTab, number> };
};

/** アプリ内通知(NotificationResource)。Web標準のNotificationと名前がぶつからないようAppを付ける */
export type AppNotification = {
  id: string;
  /** matched / declined / expired(求職者向け)、received(企業向け) */
  kind: string;
  /** 送った時点で作った文言(そのまま表示する) */
  message: string;
  /** 押したときに開く応募 */
  like_id: number;
  read_at: string | null;
  created_at: string;
};

/** Laravelのページ分割(paginate)の返り値 */
export type Paginated<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

/** 1件を返すAPIの返り値(JsonResourceはdataで包まれる) */
export type Wrapped<T> = {
  data: T;
};
