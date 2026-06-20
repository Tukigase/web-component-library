# アナログ時計型タイムピッカー 使い方ガイド

`<analog-time-picker>` は、スマートフォンなどの標準時計アプリのような直感的なUIを提供する入力コンポーネントです。

## 1. 基本的な使い方

HTMLファイル内でJSを読み込み、タグを記述するだけで機能します。
CDN（jsDelivr）を利用すると、ファイルのダウンロード不要で直接インポート可能です。

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/Tukigase/web-component-library@main/js/component.js"></script>

<analog-time-picker></analog-time-picker>

<analog-time-picker name="meeting_time" value="15:30"></analog-time-picker>
```

### 利用可能な属性 (Attributes)
| 属性名  | 説明 | 初期値 | 例 |
| :--- | :--- | :--- | :--- |
| `value` | 初期表示される時刻（`HH:MM` 形式）。 | `12:00` | `value="09:15"` |
| `name`  | フォーム送信時のパラメータ名。 | (なし) | `name="start_time"` |

---

## 2. フォームとの連携

標準的な `<input>` 要素と全く同じように扱えます。`<form>` タグで囲んで送信ボタンを押すと、自動的に指定した `name` で値が送信されます。JavaScriptから `FormData` で取得することも可能です。

```html
<form action="/api/submit" method="POST">
  <label>お名前:</label>
  <input type="text" name="username">

  <label>希望時間:</label>
  <analog-time-picker name="appointment_time" value="10:00"></analog-time-picker>

  <button type="submit">送信</button>
</form>
```

---

## 3. デザインのカスタマイズ (テーマ設定)

コンポーネント内部のデザインは、CSS変数（カスタムプロパティ）を使って外部から安全に変更できます。
呼び出し元のCSSの `:root` や、コンポーネントを囲むコンテナに対して変数を定義してください。

### カスタマイズ例：ブランドカラーを赤にする

```css
/* サイト全体に適用する場合 */
:root {
  --atp-primary: #ef4444;       /* 針やアクティブな文字の色を赤に */
  --atp-clock-bg: #fffbeb;      /* 時計の背景を薄い黄色に */
  --atp-icon-color: #ef4444;    /* アイコンの色も赤に */
}
```

### CSS変数一覧

| 変数名 | デフォルト値 (ライト) | ダークモード時 | 説明 |
| :--- | :--- | :--- | :--- |
| `--atp-primary` | `#007bff` | `#60a5fa` | メインのアクセントカラー（時計の針、ドット、アクティブ文字） |
| `--atp-bg` | `#ffffff` | `#1e293b` | ポップアップ自体の背景色 |
| `--atp-text-main` | `#333333` | `#f8fafc` | 時計の文字盤の数字など、メインテキスト |
| `--atp-text-sub` | `#888888` | `#64748b` | 上部のデジタル時刻表示などのサブテキスト |
| `--atp-input-bg` | `#ffffff` | `#0f172a` | 入力欄（テキストボックス）の背景色 |
| `--atp-input-border` | `#cccccc` | `#334155` | 入力欄（テキストボックス）の枠線色 |
| `--atp-clock-bg` | `#e0e5ec` | `#334155` | 丸い時計の盤面の背景色 |
| `--atp-clock-shadow`| `inset 2px 2px 5px rgba(...)` | `inset 2px 2px 5px rgba(...)` | 丸い時計の盤面の影 |
| `--atp-popup-shadow`| `0 8px 24px rgba(...)` | `0 8px 24px rgba(...)` | ポップアップ全体のドロップシャドウ |
| `--atp-icon-color` | `#666666` | `#94a3b8` | 入力欄右側の時計アイコンの色 |

※ ダークモードは `prefers-color-scheme: dark` により自動的に適用されます。
