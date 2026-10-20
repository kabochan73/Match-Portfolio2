# ローカル開発用(npm run dev)。docker-compose側でソースディレクトリをvolumeマウントし、
# ホットリロードが効くようにする。本番用のステージはデプロイ作業の時に追加する
FROM node:22-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
