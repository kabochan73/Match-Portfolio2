# フロントエンド構成

Next.js(App Router)のフォルダ構成と、ページごとのレンダリング方式・キャッシュ方針。画面・URLの一覧は`SCREEN_FLOW.md`を参照。

## 1. 基本方針

- **認証はハイブリッド方式**: データの読み取り(GET)はServer Componentから、更新(POST/PUT/DELETE)はブラウザからLaravel APIを呼ぶ。独自のBFF(API Route等で書く中継処理)は持たない
- **ブラウザからは同じドメインの`/api`経由で呼ぶ**: Railwayの`*.up.railway.app`ではフロントとバックエンドが別サイト扱いになり、ログインのCookieが送られない。そのため`next.config.ts`のrewritesで、`/api/*`と`/sanctum/*`をLaravelへそのまま中継する(ローカルも同じ構成)
  - ブラウザ → `フロントのドメイン/api/...` → (rewrites) → Laravel
  - Server Component → Next.jsのサーバーから`API_INTERNAL_URL`のLaravelを直接呼ぶ(CookieとOriginヘッダーを転送)
  - CORSの設定は不要(ブラウザから見て常に同じドメインのため)
- **キャッシュはCache Componentsで行う**(`next.config.ts`の`cacheComponents: true`。Next.js 16の推奨方式)。1つのページを「静的な骨組み」と「`<Suspense>`の中でリクエストごとに描画する部分」に分けられる(Partial Prerendering)。キャッシュしたい取得処理には`'use cache'`・`cacheTag()`・`cacheLife()`を付ける
- **SC/CCの判断基準**: 誰が見ても同じ内容の公開ページはSC(Server Component)にしてキャッシュする。本人専用のログイン後ページは、共有キャッシュの対象にならないため、CC(Client Component)とTanStack Queryで扱う。Cache Componentsの恩恵を受けるのは主に公開ページ
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
│   └── internal/revalidate/       Laravelから呼ぶキャッシュ再検証用のRoute Handler(/apiはLaravelへの中継に使うため、別のパスに置く)
├── components/
│   ├── ui/                        共通部品(Button, Input, Tag, Badge, Card, Dialog, Tabs等)。デザイン方針をここに集約する
│   ├── layout/                    Header(公開 / 求職者 / 企業)、Footer
│   ├── jobs/                      求人カード、検索サイドバー、いいねフォーム
│   ├── companies/                 企業ページの各セクション
│   ├── seeker/                    求職者専用
│   └── company/                   企業専用
├── lib/
│   ├── api/                       client.ts(ブラウザ用。同じドメインの/apiを呼ぶ) / server.ts(SC用。Laravelを直接呼び、CookieとOriginヘッダーを転送) / config.ts
│   ├── query/                     QueryClient
│   ├── jobs/ seeker/ company/     API呼び出し関数、Zodスキーマ、queryOptions
│   └── utils/                     cn()(clsx + tailwind-merge)、日付・給与の整形
└── hooks/                         自作フック
```

- `(public)` `(seeker)` `(auth)` `(protected)`はroute group(URLに影響しない)
- ログイン後ページの認証ガードは`(protected)/layout.tsx`で行う。`/api/seeker/me`(企業は`/api/company/me`)を取得し、401なら`redirect()`する。`cookies()`を読むため、この部分は`<Suspense>`で囲む(Cache Componentsのルール)

## 3. ページごとのレンダリング方式

| ページ | 静的な骨組み | `'use cache'`でキャッシュする部分 | `<Suspense>`の中でリクエストごとに描画する部分 |
|---|---|---|---|
| `/` トップ | ヒーロー・コンセプト・使い方・CTA | 技術スタックの一覧(マスタ。タグ`masters`) | 技術スタックの一覧(本番のビルド環境からLaravelに繋がらないため、`connection()`でアクセス時に取得)、ヘッダーのログイン状態 |
| `/for-companies` | ページ全体 | なし | なし |
| `/jobs` 求人一覧 | 見出し・検索サイドバーの枠 | 検索結果(検索条件ごとにキャッシュ。タグ`jobs`・5分) | 検索結果(`searchParams`を読むため)、ヘッダーのログイン状態 |
| `/jobs/[id]` 求人詳細 | ページの枠 | 求人(タグ`job-12`・5分) | ヘッダーのログイン状態 |
| `/companies/[id]` 企業ページ | ページの枠 | 企業ページ(タグ`company-3`・5分) | ヘッダーのログイン状態 |
| ログイン・登録・パスワードリセット | フォームの枠 | なし | なし(フォームはCC) |
| 求職者・企業のログイン後ページ | レイアウトの枠 | なし(本人専用のため) | layoutの認証チェック。中身はCC + TanStack Query |

- **`'use cache'`の中では`cookies()`を読めない**: キャッシュは全員で共有するため。そのため取得関数を分ける
  - `apiPublicFetch`: 公開ページ用。Cookieを読まない(`'use cache'`の中で使う)
  - `apiServerFetch`: ログイン後ページ用。受け取ったCookieとOriginヘッダーをLaravelへ転送する(`<Suspense>`の中で使う)
- **`cookies()`や`searchParams`を読む部分は`<Suspense>`で囲む**: 囲むと、その部分だけがリクエストごとに描画され、残りは静的な骨組みとして配信される。囲み忘れは開発中に警告が出る
- **公開ページのヘッダー**: ログイン状態を読む部分だけを`<Suspense>`で囲み、閲覧者(ゲスト / 求職者 / 企業)に応じて出し分ける。ページ本体のキャッシュには影響しない
- **キャッシュの保存先**: 標準ではサーバーのメモリ。Railwayでサーバーが1台なら問題ないが、デプロイのたびにキャッシュは空に戻る
- **公開ページ上の「自分の状態」**(🔖済み・いいね済み): 共有キャッシュには入れられないため、自分のブックマーク・応募をCCで別に取得し、カードや詳細に重ねて表示する

## 4. キャッシュの再検証

| データ | 再検証のタイミング | 理由 |
|---|---|---|
| 求人・企業ページの内容 | 企業が編集・公開・募集終了したとき、Laravelから`/internal/revalidate`を呼んで該当タグを即時に再検証する | 内容の変更はすぐ反映したい |
| いいね数・人気順 | 時間で再検証する(5分) | いいねのたびに再検証するとキャッシュの意味が薄れるため、最大5分の遅れを許容する |

- 再検証は`cacheTag()`で付けたタグに対して`revalidateTag`で行う。Next.js 16では第2引数が必須。外部(Laravel)から即時反映したい場合は`{ expire: 0 }`を使う
- いいね数の5分は、`cacheLife()`で有効期限として指定する
- 自分の操作の結果(いいね済み・🔖済み)は、上記の遅れとは関係なく、CC側ですぐ反映される

## 5. 楽観的UI

| 操作 | 楽観的UI | 理由 |
|---|---|---|
| 🔖 ブックマーク | 使う(押した瞬間に切り替え、失敗したら元に戻す) | ほぼ失敗せず、何度も押す操作のため |
| ❤️ いいね(応募) | 使わない(送信中表示 → 成功を確認してから「いいね済」) | 月間上限・重複応募などで失敗しうる操作で、「送れたと思ったら取り消された」は応募では致命的なため |

- カードに表示するいいね数は、自分がいいねした直後も画面側で+1しない。キャッシュの更新と重なると二重に数えるおそれがあるため

## 6. 求人一覧の表示件数

- 1ページ24件のページネーション(`/jobs?page=2`)。下に「前へ・番号・次へ」を置き、8ページ以上は「1 … 5 6 7 … 12」のように間を省く
- 24件は1・2・3・4列のどれでも割り切れ、画面幅で列数が変わっても最後の行が中途半端にならないため
- PCでも検索サイドバー+最大2列(3列だとカードが狭く見にくいため)
- 当初は「もっと見る」ボタンの予定だったが、ページネーションに変更した。ページごとにURLが決まるため、SCでそのまま描画でき、検索条件ごと・ページごとにキャッシュが効く。求人詳細から戻ったときも同じページに戻れる
- 検索条件・並び順を変えたら1ページ目に戻る。最後のページより先の番号が手入力された場合は、1ページ目へのリンクを出す

## 7. TanStack Queryの方針

- デフォルトの`staleTime`は60秒
- 自分の操作でしか変わらないデータ(自分のプロフィール、職歴・学歴・資格など)は`staleTime: Infinity`にし、更新時に`invalidateQueries`で同期する
- ログアウト時は`queryClient.clear()`でキャッシュをすべて消す
