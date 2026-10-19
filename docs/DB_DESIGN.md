# DB設計

`REQUIREMENTS.md` の内容をもとにしたテーブル設計。DBはPostgreSQLを想定。テーブルごとに確認しながら確定させていく。

## 1. テーブル定義

### users(求職者)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| name | string | not null | |
| email | string | unique, not null | ログインID。マッチ成立後は企業側に開示される(要件3) |
| password | string | not null | |
| comment | string(200) | nullable | 自己紹介コメント |
| portfolio_url | string | nullable | GitHub・個人サイト等のURL |
| birth_date | date | not null | 生年月日。18歳以上60歳以下のみ許可(バックエンドは`now()->subYears()`で動的にバリデーション)。企業側では年齢に変換して表示 |
| avatar_path | string | nullable | アイコン画像。画像はストレージ(public disk)に保存し、相対パスのみ持つ |
| remember_token | string | nullable | Laravel標準 |
| created_at / updated_at | timestamp | | |

- メール認証は行わないため、Laravel標準の`email_verified_at`は持たない
- 求職者のスキル(技術スタック)は持たない。習熟度に幅があり、タグだけでは実力を表せないため。スキルの判断材料は`portfolio_url`に委ねる

### work_experiences(求職者の職歴)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null, cascade delete | |
| company_name | string | not null | |
| started_on | date | not null | 在籍開始年月(日は1日固定) |
| ended_on | date | nullable | 在籍終了年月(日は1日固定)。nullは在籍中 |
| employment_type | string(enum) | not null | `job_postings.employment_type`と同じ区分 |
| created_at / updated_at | timestamp | | |

表示順は`started_on`の降順。0件可。

### educations(求職者の学歴)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null, cascade delete | |
| school_name | string | not null | |
| created_at / updated_at | timestamp | | |

0件可。表示順は登録順。

### certifications(求職者の資格)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null, cascade delete | |
| name | string | not null | 資格名のみ(取得年月は管理しない) |
| created_at / updated_at | timestamp | | |

- unique制約: `(user_id, name)`(同一資格の重複登録を防止)
- 0件可。表示順は登録順

### companies(企業。1社1アカウント)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| name | string | not null | 会社名 |
| email | string | unique, not null | ログインID。求職者には公開しない |
| password | string | not null | |
| remember_token | string | nullable | Laravel標準 |
| avatar_path | string | nullable | ロゴ画像。相対パスのみ持つ |
| introduction | string(200) | nullable | 企業ページ①簡単な自己紹介 |
| business_description | text | nullable | 企業ページ②事業内容 |
| culture | text | nullable | 企業ページ③カルチャー |
| founded_year | unsigned smallint | nullable | 企業ページ⑦設立年 |
| member_count | unsigned integer | nullable | 企業ページ⑦メンバー数(人数を数値で自由入力) |
| prefecture | string(enum) | nullable | 企業ページ⑦所在地(都道府県) |
| address_line | string | nullable | 企業ページ⑦所在地(市区町村以下) |
| website_url | string | nullable | 企業ページ⑦WebサイトURL |
| created_at / updated_at | timestamp | | |

- 企業ページの項目はすべてnullable。会員登録直後は会社名のみの状態を許容する
- 企業ページ④技術スタック・⑤働き方はマスタ+中間テーブル(後述)、⑥写真ギャラリーは`company_images`、⑧募集中の求人は`job_postings`から取得する
- 電話番号・連絡用メールアドレスは持たない。マッチ後の連絡は企業から求職者へ行うため(要件3)
- 前作の`description`(会社概要)は、`introduction`と`business_description`に分割した。前作の`member_count_range`(レンジ選択)は数値の自由入力に変更した

### company_images(企業ページの写真ギャラリー。最大5枚)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| company_id | bigint FK → companies.id | not null, cascade delete | |
| path | string | not null | 相対パスのみ持つ |
| created_at / updated_at | timestamp | | |

- 並び替えはしない(登録順=表示順)ため、`position`カラムは持たない
- 1社あたり最大5枚の上限はアプリ側で検証する

### マスタテーブル(共通方針)

職種・技術スタック・働き方は、後から選択肢を追加する際にコード修正が不要になるよう、enumではなくマスタテーブルで持つ。データはシーダーで投入し、運営のみが変更するため、タイムスタンプは持たない。

#### job_categories(職種マスタ)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| name | string | unique, not null | 例: バックエンド |
| group_name | string | not null | 検索サイドバーでの分類見出し。例: 開発 |
| sort_order | unsigned smallint | not null | 表示順 |

初期データ(要件4.3の一覧と同じ):
- 開発: バックエンド / フロントエンド / フルスタック / iOS / Android / 組み込み・IoT / ゲーム
- インフラ: インフラ / SRE / クラウド / ネットワーク / セキュリティ
- データ・AI: データエンジニア / データサイエンティスト / 機械学習エンジニア
- 品質・運用: QA・テスト / 社内SE・情報システム
- マネジメント: テックリード / エンジニアリングマネージャー / プロジェクトマネージャー / プロダクトマネージャー
- その他: UI/UXデザイナー / Webディレクター / セールスエンジニア / ITコンサルタント

#### tech_stacks(技術スタックマスタ)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| name | string | unique, not null | 例: Laravel |
| group_name | string | not null | 例: フレームワーク |
| sort_order | unsigned smallint | not null | 表示順 |

初期データ(全リストはシーダー作成時に確定):
- 言語: PHP, JavaScript, TypeScript, Python, Ruby, Go, Java, Kotlin, Swift, C#, Rust, Dart
- フレームワーク: Laravel, Ruby on Rails, Django, Spring Boot, React, Next.js, Vue.js, Nuxt, Flutter
- インフラ・クラウド: AWS, GCP, Azure, Docker, Kubernetes, Terraform
- データベース: MySQL, PostgreSQL, Redis, MongoDB
- ツール: Git, GitHub Actions

#### work_styles(働き方マスタ)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| name | string | unique, not null | 例: フルリモート |
| sort_order | unsigned smallint | not null | 表示順 |

選択肢が少ないため`group_name`は持たない。

初期データ: フルリモート / リモート併用 / フレックスタイム / コアタイムなし / 副業OK / 服装自由 / 時短勤務OK

### company_tech_stack(企業⇔技術スタック)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| company_id | bigint FK → companies.id | not null, cascade delete | |
| tech_stack_id | bigint FK → tech_stacks.id | not null, restrict delete | |

- 主キー: `(company_id, tech_stack_id)`
- 選択数の上限なし(検索で優遇されるわけではないため)

### company_work_style(企業⇔働き方)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| company_id | bigint FK → companies.id | not null, cascade delete | |
| work_style_id | bigint FK → work_styles.id | not null, restrict delete | |

- 主キー: `(company_id, work_style_id)`
- 選択数の上限なし

### job_postings(求人)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| company_id | bigint FK → companies.id | not null, cascade delete | |
| title | string | not null | |
| description | text | not null | 仕事内容 |
| desired_candidate | text | not null | 求める人材 |
| employment_type | string(enum) | not null | `full_time`(正社員) / `contract`(契約社員) / `part_time`(アルバイト) / `freelance`(業務委託) / `internship`(インターン) |
| prefecture | string(enum) | not null | 勤務地。都道府県に加え「リモート」を含む。検索の絞り込み条件 |
| salary_min | unsigned integer | not null | 月給の下限(円)。表示のみ、絞り込みには使わない |
| salary_max | unsigned integer | not null | 月給の上限(円)。表示のみ |
| selection_steps | jsonb | not null | 選考フロー。ステップ名の配列(例: `["カジュアル面談", "一次面接", "最終面接", "内定"]`)。1〜6ステップ |
| status | string(enum) | not null, default `draft` | `draft`(下書き) / `published`(公開中) / `closed`(募集終了) |
| published_at | timestamp | nullable | 初回公開日時。`published_at`から30日以内なら求人一覧で「NEW」を表示する(専用カラムは持たず都度判定) |
| created_at / updated_at | timestamp | | |

- **給与は月給で統一する**。年収表記は賞与・残業代込みの額で高く見せられてしまうため。フォームでは万円単位で入力し、保存時に円へ変換する
- **同時に公開できる求人は1社10件まで**(`status = published`の件数をアプリ側で検証。`draft`/`closed`は数えない)。同じような求人の大量掲載で、AND条件の検索結果を独占されるのを防ぐため。求職者のいいね月間上限と対になる、「企業側にも求人を厳選させる」仕組み
- 選考フローは表示専用で検索・集計に使わないため、別テーブルにせずjsonbで持つ(Laravelでは`array`キャスト)
- キーワード検索の対象は`title`と`description`
- いいね数(=応募数)はカウンタカラムを持たず、`likes`を`job_posting_id`でCOUNTして算出する
- 雇用形態のenumは`work_experiences.employment_type`と共通
- 前作の`unpublished`(支払い失敗による自動非公開)は、Stripe課金の削除に伴い廃止

**状態遷移**:
- `draft` → `published`(公開。初回のみ`published_at`を記録)
- `published` → `closed`(募集終了。検索に出なくなり、新規のいいねを受け付けない)
- `closed` → `published`(募集再開。`published_at`は初回公開日時のまま更新しない)
- 公開・募集再開のどちらも、公開中10件の上限チェックの対象

**募集終了時の既存の応募**: 反応待ち(`applied`)の応募はそのまま残す。企業は募集終了後も期限内にマッチ・見送りを返せ、放置すれば通常どおり期限切れで不成立になる。企業側の求人一覧・詳細には、反応待ちの件数を警告表示する

**削除**: いいねが1件でもある求人は削除できない(募集終了のみ可能)。削除できるのは、いいね0件の求人(作成ミス等)だけ。応募者一覧・応募状況・通知のリンク・いいねの月間カウントが、削除によって壊れるのを防ぐため。以下の3段階で守る
1. 画面: いいねがある求人では削除ボタンを出さない
2. API: いいねの件数を確認し、あれば削除を拒否する
3. DB: `likes.job_posting_id`のFKをrestrictにする

### job_posting_images(求人の画像ギャラリー。最大5枚)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| job_posting_id | bigint FK → job_postings.id | not null, cascade delete | |
| path | string | not null | 相対パスのみ持つ |
| created_at / updated_at | timestamp | | |

- `company_images`と同じく、登録順=表示順で`position`は持たない。最大5枚はアプリ側で検証する

### job_posting_job_category(求人⇔職種)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| job_posting_id | bigint FK → job_postings.id | not null, cascade delete | |
| job_category_id | bigint FK → job_categories.id | not null, restrict delete | |

- 主キー: `(job_posting_id, job_category_id)`
- 1求人につき1〜3件(アプリ側で検証)

### job_posting_tech_stack(求人⇔技術スタック)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| job_posting_id | bigint FK → job_postings.id | not null, cascade delete | |
| tech_stack_id | bigint FK → tech_stacks.id | not null, restrict delete | |

- 主キー: `(job_posting_id, tech_stack_id)`
- 選択数の上限なし

### likes(いいね = 応募)
求職者が求人に「いいね」した時点でレコードが作成される。いいね自体が応募の意思表示であり、別途`applications`テーブルは持たない。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null, cascade delete | |
| job_posting_id | bigint FK → job_postings.id | not null, **restrict delete** | いいねがある求人の削除をDBレベルでも防ぐ(job_postingsの「削除」参照) |
| like_type | string(enum) | not null | `standard`(通常のいいね) / `super`(スーパーいいね) |
| motivation | text | not null | 志望動機(文字数上限なし) |
| status | string(enum) | not null, default `applied` | 下記参照 |
| response_deadline | timestamp | not null | `created_at` + 7日。企業の反応期限(`like_type`によらず共通) |
| responded_at | timestamp | nullable | 企業がマッチ(気になる)または見送りを返した日時 |
| created_at / updated_at | timestamp | | `created_at`がいいねした日時 |

`status`の意味と応募状況ページのタブ:

| status | 意味 | 求職者側のタブ | 企業側のタブ | 同じ求人に再いいね |
|---|---|---|---|---|
| `applied` | 企業の反応待ち | いいね済 | 反応待ち | 不可 |
| `matched` | 企業が「気になる」を返しマッチ成立。企業側に求職者のメールアドレスを開示 | マッチ | マッチ | 不可 |
| `declined` | 企業が「見送り」を返した | 不成立 | 不成立 | 不可 |
| `expired` | 7日以内に企業の反応がなく自動で不成立(バッチで更新) | 不成立 | 不成立 | **可** |

- 部分ユニークインデックス: `UNIQUE (user_id, job_posting_id) WHERE status <> 'expired'`。反応待ち・マッチ・見送りの求人への重複応募を防ぎつつ、期限切れの求人には再度いいねできるようにする
- 見送り後に再いいねできないのは、企業が明示的に判断した結果のため。期限切れは企業側の判断がないため再挑戦を認める
- 不成立タブでは、見送りと期限切れを区別して表示する(例:「見送り」「期限切れ」のラベル)
- **月間上限**: 当月(月初リセット)に作成した`likes`を`like_type`ごとにCOUNTして判定する(通常10件・スーパー1件)。カウンタカラムは持たない
- **期限切れバッチ**: `status = applied`かつ`response_deadline`を過ぎたものを`expired`に更新する(1時間おきにスケジューラで実行)
- マッチ後の選考プロセスはステータスとして管理しない(要件3)
- 前作からの変更: `applied_at`は`created_at`と同値のため削除。`company_responded_at`は見送りでも使うため`responded_at`に改名。一覧からの非表示機能(`user_hidden_at`/`company_hidden_at`)は要件にないため削除

### bookmarks(求人のブックマーク)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null, cascade delete | |
| job_posting_id | bigint FK → job_postings.id | not null, cascade delete | 削除できるのはいいね0件の求人だけなので、cascadeで消えても応募履歴には影響しない |
| created_at | timestamp | | |

- unique制約: `(user_id, job_posting_id)`
- 件数上限なし。企業側には公開しない
- 一覧の応募状況バッジ(いいね済 / マッチ / 不成立)は、同じ求人への最新の`likes`から算出する
- 募集終了した求人のブックマークも残し、「募集終了」と表示する

### notifications(アプリ内通知。Laravel標準テーブル)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| type | string | not null | 通知クラス名 |
| notifiable_type | string | not null | `App\Models\User` / `App\Models\Company` |
| notifiable_id | bigint | not null | |
| data | json | not null | 通知内容(文言・リンク先のlike_id等) |
| read_at | timestamp | nullable | |
| created_at / updated_at | timestamp | | |

通知の種類:
- 求職者向け: マッチ成立 / 不成立(見送り・期限切れの両方で送る)
- 企業向け: 新しい応募

### パスワードリセット用テーブル
`users`と`companies`は別ガードの別テーブルで、同じメールアドレスが両方に存在しうる。Laravel標準の単一テーブル(emailのみで判定)を共用すると混同する恐れがあるため、ガードごとに分ける。

| テーブル名 | 対象 | カラム |
|---|---|---|
| `password_reset_tokens` | users | `email`(PK), `token`, `created_at` |
| `company_password_reset_tokens` | companies | `email`(PK), `token`, `created_at` |

## 2. インデックス方針

PostgreSQLはFKに自動でインデックスを張らないため、検索・一覧取得で使うものは明示的に作成する。

- `job_postings(status, prefecture, employment_type)`(検索の絞り込み)
- `job_postings(company_id, status)`(企業ページの募集中求人・公開中件数の上限チェック)
- `job_postings(status, published_at)`(新着順の並び替え)
- `likes(job_posting_id, created_at)`(人気順の並び替え。直近30日のいいね数を求人ごとにCOUNTする)
- `job_posting_job_category(job_category_id)` / `job_posting_tech_stack(tech_stack_id)`(タグからの逆引き検索。主キーの先頭が`job_posting_id`のため別途必要)
- `likes(user_id, like_type, created_at)`(月間上限のカウント)
- `likes(job_posting_id, status)`(応募者一覧・反応待ち件数)
- `likes(status, response_deadline)`(期限切れバッチ)
- `company_images(company_id)` / `job_posting_images(job_posting_id)`
- `work_experiences(user_id)` / `educations(user_id)` / `certifications(user_id)`

## 3. 補足

- **求職者/企業の認証分離**: `users`と`companies`は別テーブル・別Sanctumガードで管理する(1社1アカウントのため`companies`がそのままログイン主体を兼ねる)
- **セッション・キャッシュ・キュー**: Laravel標準の`sessions` / `cache` / `jobs`テーブルを使用する(`database`ドライバ)
