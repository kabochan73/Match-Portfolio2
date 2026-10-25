#!/bin/sh
set -e

php artisan config:clear

# schedulerサービス(RUN_MODE=scheduler)はnginx/php-fpmを起動しない。
# RailwayのCron Schedule(毎分起動)でこのコンテナを立ち上げ、schedule:runを1回実行して終了する
if [ "$RUN_MODE" = "scheduler" ]; then
  exec php artisan schedule:run
fi

# RailwayはPORT環境変数を動的に渡してくるため、コンテナ起動時にnginx設定へ反映する
export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

# ローカルのpublicディスク(storage/app/public)を/storageで配信するためのリンク。
# 本番の画像はRailway Bucketに保存するため、本番では使われない
php artisan storage:link --force || true

# 本番では画像の保存先(storage/app/public)にRailwayのVolumeをつなぐ。Volumeはrootの持ち物として用意されるため、
# php-fpm(www-data)が画像を保存・削除できるよう、起動のたびに持ち主を合わせる
mkdir -p storage/app/public
chown -R www-data:www-data storage/app/public

# 起動のたびに実行するが、未適用のマイグレーションだけが実行されるため何度実行しても安全
php artisan migrate --force

exec supervisord -c /etc/supervisor/supervisord.conf
