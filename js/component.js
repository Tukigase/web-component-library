// js/component.js

// 各コンポーネントのクラスをインポート
import { AnalogTimePicker } from './analog-time-picker.js';

// ここに他のコンポーネントを追加していく
// import { CustomCalendar } from './custom-calendar.js';

// カスタム要素としてブラウザに一括登録
const defineComponents = () => {
    if (!customElements.get('analog-time-picker')) {
        customElements.define('analog-time-picker', AnalogTimePicker);
    }
    // customElements.define('custom-calendar', CustomCalendar);
};

// 実行して登録
defineComponents();

// モジュールとして外部でも使えるようにexportしておく
export { AnalogTimePicker };