-- Pest(バックエンドのテスト)専用のDB。開発用DB(POSTGRES_DBで作られるtech_match)を
-- テストで壊さないよう分離する。/docker-entrypoint-initdb.d/以下に置くと、
-- dbコンテナの初回起動時(ボリュームが空の状態)にPostgreSQLが自動で実行する
CREATE DATABASE tech_match_test;
