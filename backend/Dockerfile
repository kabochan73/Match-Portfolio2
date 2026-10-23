# composerコマンド自体はこのイメージから拝借するだけなので、PHPを含めた別ステージにはしない
FROM composer:2 AS composer

# ローカル開発・Railway本番の両方で使う共通ベース(Nginx + PHP-FPM構成)
FROM php:8.4-fpm-alpine AS base

# GDはアップロード画像の縮小(intervention/image)に使うため、JPEG・WebP対応でビルドする。
# exifはスマホ写真の向き(回転情報)を読むために使う
RUN apk add --no-cache \
        nginx \
        supervisor \
        gettext \
        postgresql-dev \
        libzip-dev \
        icu-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install \
        pdo_pgsql \
        zip \
        intl \
        opcache \
        gd \
        exif \
    && apk del $PHPIZE_DEPS

COPY --from=composer /usr/bin/composer /usr/bin/composer

# アップロードの上限など、PHPの標準設定を上書きする
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini

WORKDIR /var/www/html

# 本番用に依存関係をインストールし、最適化したオートローダーを生成するステージ
FROM base AS build

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev

# Railwayへそのままデプロイする本番イメージ。ローカルのdocker-composeもこのステージを使い、
# volumeマウントでソースコードを上書きして開発する
FROM base AS final

COPY --from=build /var/www/html /var/www/html

COPY docker/nginx.conf.template /etc/nginx/http.d/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && rm -f /etc/nginx/http.d/default.conf \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]
