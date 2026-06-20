# Web Component Library

フレームワーク非依存で、どの環境でも利用できるピュアなWeb Components（カスタム要素）のコレクションです。
第1弾として、直感的なUIで時刻を入力できる「アナログ時計型タイムピッカー (`<analog-time-picker>`)」を提供しています。

## 🌟 特徴

- **フレームワーク不要**: ReactやVueなどがなくても、標準のHTML/JS環境で動作します。
- **ネイティブフォーム連携**: `<form>` にそのまま組み込み可能。標準の `<input>` と同じように値を送信できます。
- **フルカスタマイズ可能**: CSS変数を上書きするだけで、プロジェクトのブランドカラーに簡単に合わせられます。
- **ダークモード対応**: OSやブラウザのダークモード設定に自動追従します。

## 📂 ディレクトリ構成

```text
.
├── README.md              # このファイル
├── css/                   # コンポーネント用CSS群
│   ├── component.css
│   └── analog-time-picker.css
├── js/                    # コンポーネント用JS群
│   ├── component.js       # エントリーポイント
│   └── analog-time-picker.js
└── doc/                   # ドキュメント・デモ
    ├── USAGE.md           # 詳細な使い方ドキュメント
    └── index.html         # 動作確認用デモページ
```

## 🚀 クイックスタート

ファイルをプロジェクトにダウンロードしなくても、CDN経由で1行読み込むだけですぐに利用できます。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Quick Start</title>
  <script type="module" src="https://cdn.jsdelivr.net/gh/Tukigase/web-component-library@main/js/component.js"></script>
  <style>
    /* 読み込み前の一瞬のレイアウト崩れを防ぐ推奨設定 */
    analog-time-picker:not(:defined) { opacity: 0; visibility: hidden; }
    analog-time-picker { transition: opacity 0.3s; opacity: 1; visibility: visible; }
  </style>
</head>
<body>
  
  <analog-time-picker name="time" value="12:30"></analog-time-picker>

</body>
</html>
```

### ローカルでの開発・利用
リポジトリをクローンして利用する場合は以下のようになります。
```bash
git clone https://github.com/Tukigase/web-component-library.git
```

## 📖 ドキュメント & ライブデモ

- 📄 **[詳細な使い方ガイド](https://github.com/Tukigase/web-component-library/blob/main/doc/USAGE.md)**: 属性（Attributes）の一覧や、テーマを変更するためのCSS変数リファレンスはこちらをご覧ください。
- 🌐 **[オンライン見本サイト（ライブデモ）](https://tukigase.github.io/web-component-library/doc/)**: ブラウザ上で実際にコンポーネントを動かしたり、テーマカスタマイズやフォーム送信の挙動を確認できるデモページです。


## 📄 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。
商用・非商用問わず、誰でも自由に利用・改変・再配布が可能です。
