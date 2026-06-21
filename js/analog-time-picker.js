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
    
    const initialValue = this.getAttribute('value') || '12:00';
    this.setValue(initialValue);
    this.switchMode('hour');
  }

  get format() {
    return this.getAttribute('format') || '24';
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
      this.currentHour = h;
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

  generateClockFaces() {
    this.clock.querySelectorAll('.clock-number').forEach(el => el.remove());
    this.numberElements = [];

    const createNumber = (num, radius, angleRad) => {
      const numDiv = document.createElement('div');
      numDiv.classList.add('clock-number');
      const x = 120 + radius * Math.cos(angleRad);
      const y = 120 + radius * Math.sin(angleRad);
      numDiv.style.left = `${x}px`;
      numDiv.style.top = `${y}px`;
      numDiv.textContent = num;
      numDiv.style.opacity = 0;
      this.clock.appendChild(numDiv);
      this.numberElements.push(numDiv);
    };

    if (this.mode === 'hour') {
      if (this.format === '24') {
        // ★ 外側のリング (午前: 00 と 1〜11)
        for (let i = 1; i <= 12; i++) {
          const angleRad = (i * 30 - 90) * (Math.PI / 180);
          const displayNum = i === 12 ? '00' : i.toString();
          createNumber(displayNum, 95, angleRad);
        }
        // ★ 内側のリング (午後: 12 と 13〜23)
        for (let i = 1; i <= 12; i++) {
          const angleRad = (i * 30 - 90) * (Math.PI / 180);
          const displayNum = i === 12 ? '12' : (i + 12).toString();
          createNumber(displayNum, 60, angleRad);
        }
      } else {
        // 12時間フォーマット (1〜12)
        for (let i = 1; i <= 12; i++) {
          const angleRad = (i * 30 - 90) * (Math.PI / 180);
          createNumber(i.toString(), 95, angleRad);
        }
      }
    } else {
      for (let i = 1; i <= 12; i++) {
        const angleRad = (i * 30 - 90) * (Math.PI / 180);
        const min = i === 12 ? 0 : i * 5;
        createNumber(min.toString().padStart(2, '0'), 95, angleRad);
      }
    }

    setTimeout(() => {
      this.numberElements.forEach(el => el.style.opacity = 1);
    }, 50);
  }

  switchMode(newMode) {
    this.mode = newMode;
    this.generateClockFaces();
    
    if (this.mode === 'hour') {
      this.hourDisplay.classList.add('active');
      this.minuteDisplay.classList.remove('active');
      this.updateHandPosition(this.currentHour, 'hour');
    } else {
      this.hourDisplay.classList.remove('active');
      this.minuteDisplay.classList.add('active');
      this.updateHandPosition(this.currentMinute, 'minute');
    }
  }

  updateHandPosition(value, type) {
    if (type === 'hour') {
      // ★ 24時間制の場合、午後(12〜23)なら内側を指すように判定を変更
      const isInner = this.format === '24' && (value >= 12 && value <= 23);
      this.hand.style.height = isInner ? '25%' : '38%';
      this.hand.style.transform = `rotate(${value * 30}deg)`;
    } else {
      this.hand.style.height = '38%';
      this.hand.style.transform = `rotate(${value * 6}deg)`;
    }
  }

  getPointerData(e) {
    const rect = this.clock.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    const distance = Math.hypot(x, y);
    return { angle, distance };
  }

  updateTime(pointerData) {
    const { angle, distance } = pointerData;

    if (this.mode === 'hour') {
      let baseHour = Math.round(angle / 30);
      if (baseHour === 0) baseHour = 12;

      if (this.format === '24') {
        if (distance < 75) {
          // ★ 内側のリング (午後: 12 と 13〜23)
          this.currentHour = baseHour === 12 ? 12 : baseHour + 12;
        } else {
          // ★ 外側のリング (午前: 00 と 1〜11)
          this.currentHour = baseHour === 12 ? 0 : baseHour;
        }
      } else {
        this.currentHour = baseHour;
      }

      this.hourDisplay.textContent = this.currentHour.toString().padStart(2, '0');
      this.updateHandPosition(this.currentHour, 'hour');

    } else if (this.mode === 'minute') {
      let minute = Math.round(angle / 6);
      if (minute === 60) minute = 0;
      this.currentMinute = minute;
      this.minuteDisplay.textContent = this.currentMinute.toString().padStart(2, '0');
      this.updateHandPosition(this.currentMinute, 'minute');
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
    this.updateTime(this.getPointerData(e));
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.hand.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.2s ease';
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