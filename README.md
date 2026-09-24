# 株式会社MICHI ホームページ

大阪の解体工事会社「株式会社MICHI」のホームページ。
旧サイト: https://kabumichi.hp.peraichi.com/

**HTML / CSS / JavaScript だけで作っています（ビルド不要）。**
フォルダの中身をそのままサーバーにアップロードすれば動きます。

## フォルダ構成

```
index.html          … トップページ
contact.php         … お問い合わせフォームの送信処理（PHPが動くサーバーでのみ動作）
assets/css/style.css
assets/js/main.js
assets/img/         … 画像（施工事例のサムネイル・ロゴ）
lp/                 … LPページ（これから作成）
```

- 動画は YouTube（株式会社MICHI のチャンネル）から埋め込み。ファイルとしては持っていない
- リンクはすべて相対パスなので、ドメイン直下でもサブフォルダでも動く

## 確認用に GitHub Pages で公開する

1. GitHub の リポジトリ → Settings → Pages
2. Source: `Deploy from a branch` ／ Branch: `main` ／ `/ (root)` → Save
3. 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で見られる

※ GitHub Pages では PHP が動かないため、**フォームの送信だけは失敗します**（失敗時は電話番号を案内する表示になる）。

## Xserver に移す

1. サーバーパネル → ドメイン設定で独自ドメインを追加（無料SSLもON）
2. このリポジトリを ZIP でダウンロード（Code → Download ZIP）して解凍
3. ファイルマネージャー（または FTP）で `/<ドメイン>/public_html/` にアップロード
   - `index.html` が `public_html` の直下に来るように置く
   - 最初からある `index.html`（Xserver の初期ページ）は上書きしてよい
4. Xserver のメール設定で送信用アドレス（例: `info@<ドメイン>`）を作成
5. `contact.php` の2行を書き換える
   - `TO_ADDRESS` … お問い合わせを受け取るアドレス
   - `FROM_ADDRESS` … 4 で作ったアドレス（ここがサイトのドメインでないと迷惑メール扱いされやすい）
6. フォームから試し送信して、受信と自動返信を確認

## 公開前に先方へ確認すること

- [ ] 受信用メールアドレス（現在 `t.y.takayama@outlook.jp`）
- [ ] 独自ドメイン名
- [ ] 事業内容の説明文（「構築物の解体撤去」「仮設工事・関連工事」の例示が実態と合っているか）
- [ ] 施工事例の名前・説明（現在は旧サイトどおり「事例①〜③」）
- [ ] 代表者の写真・現場写真があれば差し替えたい（いまは看板画像と動画のサムネイルのみ）
- [ ] 対応エリアの表記（旧サイトは「近畿一円」）
