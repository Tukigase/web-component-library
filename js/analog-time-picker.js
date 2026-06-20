// js/analog-time-picker.js

export class AnalogTimePicker extends HTMLElement {
    static get formAssociated() {
        return true;
    }

    constructor() {
        super();
        this.internals = this.attachInternals();
        this.shadow = this.attachShadow({ mode: 'open' });

        this.mode = 'hour';
        this.currentHour = 12;
        this.currentMinute = 0;
        this.isDragging = false;
        this.numberElements = [];

        this.handleMoveDrag = this.moveDrag.bind(this);
        this.handleEndDrag = this.endDrag.bind(this);
        this.handleStartDrag = this.startDrag.bind(this);

        this.render();
    }

    connectedCallback() {
        this.cacheElements();
        this.addEventListeners();
        this.initClockFaces();

        const initialValue = this.getAttribute('value') || '12:00';
        this.setValue(initialValue);
        this.switchMode('hour');
    }

    get value() {
        const h = this.currentHour.toString().padStart(2, '0');
        const m = this.currentMinute.toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    set value(val) {
        this.setValue(val);
    }

    setValue(val) {
        const [h, m] = val.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
            this.currentHour = h === 0 ? 12 : h;
            this.currentMinute = m;
            if (this.timeInput) this.timeInput.value = val;
            this.internals.setFormValue(val);
        }
    }

    cacheElements() {
        this.inputWrapper = this.shadow.getElementById('inputWrapper');
        this.timeInput = this.shadow.getElementById('timeInput');
        this.timeIcon = this.shadow.getElementById('timeIcon');
        this.clockPopup = this.shadow.getElementById('clockPopup');
        this.clock = this.shadow.getElementById('clock');
        this.hand = this.shadow.getElementById('hand');
        this.hourDisplay = this.shadow.getElementById('hourDisplay');
        this.minuteDisplay = this.shadow.getElementById('minuteDisplay');
    }

    addEventListeners() {
        const togglePopup = () => {
            if (!this.clockPopup.classList.contains('show')) {
                this.clockPopup.classList.add('show');
                this.switchMode('hour');

                const closeOnOutsideClick = (e) => {
                    if (!this.contains(e.target)) {
                        this.clockPopup.classList.remove('show');
                        document.removeEventListener('mousedown', closeOnOutsideClick);
                    }
                };
                setTimeout(() => document.addEventListener('mousedown', closeOnOutsideClick), 0);
            } else {
                this.clockPopup.classList.remove('show');
            }
        };

        this.timeIcon.addEventListener('click', togglePopup);
        this.timeInput.addEventListener('click', togglePopup);
        this.hourDisplay.addEventListener('click', () => this.switchMode('hour'));
        this.minuteDisplay.addEventListener('click', () => this.switchMode('minute'));

        this.clock.addEventListener('mousedown', this.handleStartDrag);
        this.clock.addEventListener('touchstart', this.handleStartDrag, { passive: false });
    }

    initClockFaces() {
        const radius = 95;
        for (let i = 1; i <= 12; i++) {
            const numDiv = document.createElement('div');
            numDiv.classList.add('clock-number');
            const angleRad = (i * 30 - 90) * (Math.PI / 180);
            const x = 120 + radius * Math.cos(angleRad);
            const y = 120 + radius * Math.sin(angleRad);
            numDiv.style.left = `${x}px`;
            numDiv.style.top = `${y}px`;
            this.clock.appendChild(numDiv);
            this.numberElements.push({ element: numDiv, index: i });
        }
    }

    updateClockFaces() {
        this.numberElements.forEach(item => {
            item.element.style.opacity = 0;
            setTimeout(() => {
                if (this.mode === 'hour') {
                    item.element.textContent = item.index;
                } else {
                    const min = item.index === 12 ? 0 : item.index * 5;
                    item.element.textContent = min.toString().padStart(2, '0');
                }
                item.element.style.opacity = 1;
            }, 150);
        });
    }

    switchMode(newMode) {
        this.mode = newMode;
        this.updateClockFaces();
        if (this.mode === 'hour') {
            this.hourDisplay.classList.add('active');
            this.minuteDisplay.classList.remove('active');
            this.hand.style.transform = `rotate(${this.currentHour * 30}deg)`;
        } else {
            this.hourDisplay.classList.remove('active');
            this.minuteDisplay.classList.add('active');
            this.hand.style.transform = `rotate(${this.currentMinute * 6}deg)`;
        }
    }

    getAngle(e) {
        const rect = this.clock.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - centerX;
        const y = clientY - centerY;
        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        return angle;
    }

    updateTime(angle) {
        if (this.mode === 'hour') {
            let hour = Math.round(angle / 30);
            if (hour === 0) hour = 12;
            this.currentHour = hour;
            this.hourDisplay.textContent = this.currentHour.toString().padStart(2, '0');
            this.hand.style.transform = `rotate(${hour * 30}deg)`;
        } else if (this.mode === 'minute') {
            let minute = Math.round(angle / 6);
            if (minute === 60) minute = 0;
            this.currentMinute = minute;
            this.minuteDisplay.textContent = this.currentMinute.toString().padStart(2, '0');
            this.hand.style.transform = `rotate(${minute * 6}deg)`;
        }
        const newVal = this.value;
        this.timeInput.value = newVal;
        this.internals.setFormValue(newVal);
    }

    startDrag(e) {
        this.isDragging = true;
        this.hand.style.transition = 'none';
        document.addEventListener('mousemove', this.handleMoveDrag);
        document.addEventListener('mouseup', this.handleEndDrag);
        document.addEventListener('touchmove', this.handleMoveDrag, { passive: false });
        document.addEventListener('touchend', this.handleEndDrag);
        this.moveDrag(e);
    }

    moveDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.updateTime(this.getAngle(e));
    }

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.hand.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        document.removeEventListener('mousemove', this.handleMoveDrag);
        document.removeEventListener('mouseup', this.handleEndDrag);
        document.removeEventListener('touchmove', this.handleMoveDrag);
        document.removeEventListener('touchend', this.handleEndDrag);

        if (this.mode === 'hour') {
            setTimeout(() => this.switchMode('minute'), 300);
        } else if (this.mode === 'minute') {
            setTimeout(() => this.clockPopup.classList.remove('show'), 500);
        }
    }

    render() {
        // import.meta.url を用いて、このJSファイル自身からの相対パスでCSSを取得
        const basePath = new URL('.', import.meta.url).href;
        const componentCssUrl = `${basePath}../css/component.css`;
        const pickerCssUrl = `${basePath}../css/analog-time-picker.css`;

        this.shadow.innerHTML = `
      <link rel="stylesheet" href="${componentCssUrl}">
      <link rel="stylesheet" href="${pickerCssUrl}">

      <div class="input-wrapper" id="inputWrapper">
        <input type="text" class="time-input" id="timeInput" readonly>
        <svg class="time-icon" id="timeIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
        </svg>
        <div class="clock-popup" id="clockPopup">
          <div class="time-display">
            <span id="hourDisplay" class="time-part active">12</span>:<span id="minuteDisplay" class="time-part">00</span>
          </div>
          <div class="clock-container" id="clock">
            <div class="hand" id="hand"></div>
            <div class="center-dot"></div>
          </div>
        </div>
      </div>
    `;
    }
}