# FT Hub Server

Honoを使用したバックエンドサーバーです。

## セットアップ

### 前提条件

- [Bun](https://bun.sh/) がインストールされていること

### インストール

```bash
cd server
bun install
```

## 起動方法

### 開発モード

```bash
bun run dev
```

### 本番モード

```bash
bun run start
```

サーバーはデフォルトで `http://localhost:3000` で起動します。

ポート番号を変更する場合は、環境変数 `PORT` を設定してください：

```bash
PORT=8080 bun run dev
```

## API エンドポイント

### GET /

Hello Worldを返します。

**レスポンス**

```
Hello World
```

## 技術スタック

- **Hono**: 軽量で高速なWebフレームワーク
- **Bun**: JavaScriptランタイム
- **TypeScript**: 型安全性の確保
