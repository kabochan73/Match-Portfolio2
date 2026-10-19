# フロントエンド構成

Next.js(App Router)のフォルダ構成と、ページごとのレンダリング方式・キャッシュ方針。画面・URLの一覧は`SCREEN_FLOW.md`を参照。

## 1. 基本方針

- **認証はハイブリッド方式**: データの読み取り(GET)はServer Componentから、更新(POST/PUT/DELETE)はブラウザから直接Laravel APIを呼ぶ。BFF(中継層)は挟まない
- **SC/CCの判断基準**: 誰が見ても同じ内容の公開ページはSC(Server Component)にしてキャッシュする。本人専用のログイン後ページは、共有キャッシュの対象にならないため、CC(Client Component)とTanStack Queryで扱う
- **`app/`にはルーティング用のファイル(page / layout)だけを置く**。UIは`components/`、データ取得・スキーマは`lib/`に置く

## 2. フォルダ構成

```
src/
├── app/
│   ├── (public)/                  誰でも閲覧できるページ
│   │   ├── page.tsx               /
│   │   ├── for-companies/         /for-companies
│   │   ├── jobs/                  /jobs, /jobs/[id]
│   │   └── companies/[id]/        /companies/[id]
│   ├── (seeker)/                  求職者(URLにseekerは付かない)
│   │   ├── (auth)/                login, register, forgot-password, reset-password
│   │   └── (protected)/           layout.tsxで認証ガード
│   │       └── mypage, mypage/edit, likes, likes/[id], bookmarks, notifications
│   ├── company/                   企業(URLは/company/...)
│   │   ├── (auth)/                login, register, forgot-password, reset-password
│   │   └── (protected)/           layout.tsxで認証ガード
│   │       └── profile/edit, job-postings/..., likes/..., notifications
│   └── api/revalidate/            Laravelから呼ぶキャッシュ再検証用のRoute Handler
├── components/
│   ├── ui/                        共通部品(Button, Input, Tag, Badge, Card, Dialog, Tabs等)。デザイン方針をここに集約する
│   ├── layout/                    Header(公開 / 求職者 / 企業)、Footer
│   ├── jobs/                      求人カード、検索サイドバー、いいねフォーム
│   ├── companies/                 企業ページの各セクション
│   ├── seeker/                    求職者専用
│   └── company/                   企業専用
├── lib/
│   ├── api/                       client.ts(ブラウザ用) / server.ts(SC用。Cookieと Originヘッダーを転送) / config.ts
│   ├── query/                     QueryClient
│   ├── jobs/ seeker/ company/     API呼び出し関数、Zodスキーマ、queryOptions
│   └── utils/                     cn()(clsx + tailwind-merge)、日付・給与の整形
└── hooks/                         自作フック
```

- `(public)` `(seeker)` `(auth)` `(protected)`はroute group(URLに影響しない)
- ログイン後ページの認証ガードは`(protected)/layout.tsx`で行う。`/api/users/me`(企業は`/api/companies/me`)を取得し、401なら`redirect()`する

## 3. ページごとのレンダリング方式

| ページ | 方式 | キャッシュ | CCにする部分 |
|---|---|---|---|
| `/` トップ | SC・**ISR** | 新着求人の取得をタグ+時間で再検証 | ヘッダーのログイン状態 |
| `/for-companies` | SC・**SSG** | ビルド時に1回だけ生成 | なし |
| `/jobs` 求人一覧 | SC・**SSR**(検索条件を読むため動的レンダリング) | ページは保存しないが、中の求人データの取得(fetch)をタグ+時間でキャッシュする | 検索サイドバー・並び替え(nuqs)、🔖ボタン |
| `/jobs/[id]` 求人詳細 | SC・**ISR** | 求人ごとのタグ(例: `job-12`)+時間(5分) | いいねフォーム、🔖ボタン、ログインを促すモーダル |
| `/companies/[id]` 企業ページ | SC・**ISR** | 企業ごとのタグ(例: `company-3`) | なし |
| ログイン・登録・パスワードリセット | SCの枠 + CCのフォーム | なし | フォーム |
| 求職者のログイン後ページ(6画面) | layoutで認証チェック、中身はCC | TanStack Query | ほぼすべて |
| 企業のログイン後ページ(8画面) | 同上 | TanStack Query | ほぼすべて |

- **ISRにするための条件**: 公開ページの中で`cookies()`を呼ばないこと。呼ぶとNext.jsが「人によって内容が変わるページ」と判断し、エラーを出さずに動的レンダリングへ切り替わる(気づかないうちにISRでなくなる)。そのため取得関数を分ける
  - `apiPublicFetch`: 公開ページ用。Cookieを読まない
  - `apiServerFetch`: ログイン後ページ用。受け取ったCookieとOriginヘッダーをLaravelへ転送する
- **ページ単位とfetch単位は別の話**: ISR/SSR/SSGはページ全体の作り方。`revalidate`やタグは個々のfetchのキャッシュ設定で、SSRのページ(`/jobs`)の中でも使える
- **公開ページのヘッダー**: ページ本体のキャッシュを保つため、ヘッダーだけをCCにし、閲覧者(ゲスト / 求職者 / 企業)に応じて出し分ける
- **公開ページ上の「自分の状態」**(🔖済み・いいね済み): 共有キャッシュには入れられないため、自分のブックマーク・応募をCCで別に取得し、カードや詳細に重ねて表示する

## 4. キャッシュの再検証

| データ | 再検証のタイミング | 理由 |
|---|---|---|
| 求人・企業ページの内容 | 企業が編集・公開・募集終了したとき、Laravelから`/api/revalidate`を呼んで該当タグを即時に再検証する | 内容の変更はすぐ反映したい |
| いいね数・人気順 | 時間で再検証する(5分) | いいねのたびに再検証するとキャッシュの意味が薄れるため、最大5分の遅れを許容する |

- Next.js 16では`revalidateTag`の第2引数が必須。外部(Laravel)から即時反映したい場合は`{ expire: 0 }`を使う
- 自分の操作の結果(いいね済み・🔖済み)は、上記の遅れとは関係なく、CC側ですぐ反映される

## 5. 楽観的UI

| 操作 | 楽観的UI | 理由 |
|---|---|---|
| 🔖 ブックマーク | 使う(押した瞬間に切り替え、失敗したら元に戻す) | ほぼ失敗せず、何度も押す操作のため |
| ❤️ いいね(応募) | 使わない(送信中表示 → 成功を確認してから「いいね済」) | 月間上限・重複応募などで失敗しうる操作で、「送れたと思ったら取り消された」は応募では致命的なため |

- カードに表示するいいね数は、自分がいいねした直後も画面側で+1しない。キャッシュの更新と重なると二重に数えるおそれがあるため

## 6. 求人一覧の表示件数

- 最初に24件を表示し、下の「もっと見る」ボタンで24件ずつ追加する(ページ番号は使わない)
- 24件は1・2・3・4列のどれでも割り切れ、画面幅で列数が変わっても最後の行が中途半端にならないため
- PCでは検索サイドバー+3列を想定(カードの最小幅は280px前後。画面実装時に調整)
- 無限スクロールではなくボタンにするのは、フッターにたどり着けるようにするため
- 「もっと見る」の実装方式(CCで追加取得するか、URLの件数指定でSCを再描画するか)は画面実装時に決める

## 7. TanStack Queryの方針

- デフォルトの`staleTime`は60秒
- 自分の操作でしか変わらないデータ(自分のプロフィール、職歴・学歴・資格など)は`staleTime: Infinity`にし、更新時に`invalidateQueries`で同期する
- ログアウト時は`queryClient.clear()`でキャッシュをすべて消す
