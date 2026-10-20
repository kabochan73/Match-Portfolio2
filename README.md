# Tech Match

IT・エンジニア職に特化した求人マッチングサービス。Wantedlyをモデルに機能を絞り、マッチングアプリの仕組みを取り入れています。

## コンセプト

- **待たされない**: 企業は7日以内に「気になる」か「見送り」を返す。期限を過ぎれば自動で不成立になる
- **書類いらず**: 一度作ったプロフィールが履歴書・職務経歴書の代わりになる。応募ごとに書くのは志望動機だけ
- **本気が伝わる**: いいね(=応募)は月10回、スーパーいいねは月1回まで

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| Backend | Laravel(API) / Laravel Sanctum / PostgreSQL |
| Frontend | Next.js(App Router) / React / TypeScript / Tailwind CSS / TanStack Query |
| テスト | Pest / Vitest + Testing Library |
| インフラ | Docker / Docker Compose / GitHub Actions / Railway |

詳細は[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)の「技術スタック」を参照。

## ドキュメント

| ファイル | 内容 |
| --- | --- |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | 要件定義 |
| [docs/DB_DESIGN.md](docs/DB_DESIGN.md) | DB設計 |
| [docs/SCREEN_FLOW.md](docs/SCREEN_FLOW.md) | 画面一覧・画面遷移図 |
| [docs/FRONTEND_STRUCTURE.md](docs/FRONTEND_STRUCTURE.md) | フロントエンドの構成・レンダリング方式 |
| [docs/design/](docs/design/) | デザイン |

## ローカル環境の起動

必要なもの: Docker Desktop

```sh
# 1. 環境変数ファイルを用意する
cp backend/.env.example backend/.env

# 2. 起動する(初回はイメージのビルドに数分かかる)
docker compose up -d --build

# 3. Laravelのアプリケーションキーを生成する(初回のみ)
docker compose exec app php artisan key:generate
```

| サービス | URL |
| --- | --- |
| フロントエンド(Next.js) | http://localhost:3000 |
| API(Laravel) | http://localhost:8000 |
| PostgreSQL | localhost:5432(ユーザー・パスワードともに`postgres`) |

マイグレーションは`app`コンテナの起動時に自動で実行される。

## テスト

バックエンドのテストはPostgreSQLのテスト専用DB(`tech_match_test`)で実行するため、コンテナ内で実行する。

```sh
docker compose exec app php artisan test
```

ホストのPHPで直接`php artisan test`を実行すると、DBのホスト名`db`に接続できず失敗する。
