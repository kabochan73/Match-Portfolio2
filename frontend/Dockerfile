FROM node:22-alpine AS base

WORKDIR /app

# 依存パッケージ(開発用・本番のビルド用で共通)
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

# ローカル開発用(npm run dev)。docker-compose側でソースディレクトリをvolumeマウントし、
# ホットリロードが効くようにする
FROM deps AS dev

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# 本番のビルド。/api・/sanctum・/storageの中継先(LaravelのURL)はビルド時にnext.config.tsへ埋め込まれるため、
# ビルド引数で受け取る(Railwayはサービスの変数を、同じ名前のビルド引数として渡す)
FROM deps AS build

COPY . .

ARG API_INTERNAL_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL

RUN npm run build

# Railwayへデプロイする本番イメージ。standaloneの出力(実行に必要なファイルだけ)と、静的ファイルだけを持つ
FROM base AS production

ENV NODE_ENV=production
# コンテナの外から届くよう、すべてのアドレスで待ち受ける(ポートはRailwayがPORTで渡す)
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
