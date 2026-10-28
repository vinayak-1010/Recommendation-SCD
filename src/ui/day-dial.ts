import { calculateDaylight } from '../engine/daylight.ts';

export interface DayDialOptions {
  container: HTMLElement;
  startMin: number;
  returnMin: number;
  dateStr: string;
  onChange: (start: number, returnBy: number) => void;
}

export class DayDial {
  private start: number;
  private returnBy: number;
  private dateStr: string;
  private onChange: (start: number, returnBy: number) => void;

  constructor(options: DayDialOptions) {
    this.start = options.startMin;
    this.returnBy = options.returnMin;
    this.dateStr = options.dateStr;
    this.onChange = options.onChange;

    this.render(options.container);
  }

  public setTimes(start: number, returnBy: number) {
    this.start = start;
    this.returnBy = returnBy;
    this.update();
  }

  private formatTime(m: number): string {
    const h = Math.floor(m / 60) % 24;
    const mins = m % 60;
    const ampm = h < 12 ? 'AM' : 'PM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(mins).padStart(2, '0')} ${ampm}`;
  }

  private formatDuration(m: number): string {
    const h = Math.floor(m / 60);
    const mins = m % 60;
    if (h === 0) return `${mins}m`;
    if (mins === 0) return `${h}h`;
    return `${h}h ${mins}m`;
  }

  private update() {
    const usable = Math.max(0, this.returnBy - this.start);
    const daylight = calculateDaylight(this.dateStr);

    const readout = document.getElementById('dial-usable-readout');
    if (readout) {
      readout.innerHTML = `<b>${this.formatDuration(usable)} Window</b> (${this.formatTime(this.start)} – ${this.formatTime(this.returnBy)})`;
    }

    const startInput = document.getElementById('dial-start-input') as HTMLInputElement;
    const returnInput = document.getElementById('dial-return-input') as HTMLInputElement;
    if (startInput) startInput.value = String(this.start);
    if (returnInput) returnInput.value = String(this.returnBy);

    const startSelect = document.getElementById('dial-start-select') as HTMLSelectElement;
    const returnSelect = document.getElementById('dial-return-select') as HTMLSelectElement;
    if (startSelect) startSelect.value = String(this.start);
    if (returnSelect) returnSelect.value = String(this.returnBy);

    // Daylight note
    const noteEl = document.getElementById('dial-daylight-note');
    if (noteEl) {
      if (this.returnBy <= daylight.sunset) {
        noteEl.innerHTML = `<span style="color:#00D492">☀️ Daylight Safe</span> · Returns ${this.formatDuration(daylight.sunset - this.returnBy)} before sunset (${this.formatTime(daylight.sunset)})`;
      } else {
        noteEl.innerHTML = `<span style="color:#FFA726">⚠️ Dusk Descent</span> · Returns after sunset (${this.formatTime(daylight.sunset)}) — drive carefully`;
      }
    }

    // Active presets highlight
    document.querySelectorAll('.dial-preset-btn').forEach(btn => {
      const pStart = Number(btn.getAttribute('data-pstart'));
      const pReturn = Number(btn.getAttribute('data-preturn'));
      btn.classList.toggle('active', pStart === this.start && pReturn === this.returnBy);
    });
  }

  public render(container: HTMLElement) {
    const daylight = calculateDaylight(this.dateStr);
    const usable = Math.max(0, this.returnBy - this.start);

    // Standard time options (from 6:00 AM to 10:00 PM)
    const timeOptions: { min: number; label: string }[] = [];
    for (let m = 360; m <= 1320; m += 30) {
      timeOptions.push({ min: m, label: this.formatTime(m) });
    }

    const presets = [
      { label: '⚡ 2h Quick (Clement Town)', start: 600, returnBy: 720 },
      { label: '🌤️ 4h Half Day (Doon Nature)', start: 540, returnBy: 780 },
      { label: '⛰️ 7h Mountain Day (Landour)', start: 510, returnBy: 960 },
      { label: '🌇 Evening (Cafés & Street)', start: 1020, returnBy: 1260 }
    ];

    container.innerHTML = `
      <div class="dial-container" style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px;margin-bottom:20px;box-shadow:0 8px 24px rgba(0,0,0,0.14)">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px">
          <div>
            <span style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--orange)">⏱️ Planned Travel Window</span>
            <div id="dial-usable-readout" style="font-size:15px;color:var(--tx);margin-top:2px">
              <b>${this.formatDuration(usable)} Window</b> (${this.formatTime(this.start)} – ${this.formatTime(this.returnBy)})
            </div>
          </div>
          <div id="dial-daylight-note" style="font-size:12px;color:var(--t2);background:var(--panel);padding:6px 12px;border-radius:var(--r-pill);border:1px solid var(--line)">
            ${this.returnBy <= daylight.sunset
              ? `<span style="color:#00D492">☀️ Daylight Safe</span> · Returns ${this.formatDuration(daylight.sunset - this.returnBy)} before sunset (${this.formatTime(daylight.sunset)})`
              : `<span style="color:#FFA726">⚠️ Dusk Descent</span> · Returns after sunset (${this.formatTime(daylight.sunset)})`}
          </div>
        </div>

        <!-- Quick 1-Tap Window Presets -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
          ${presets.map(p => `
            <button type="button" class="dial-preset-btn filter-chip ${p.start === this.start && p.returnBy === this.returnBy ? 'active' : ''}" 
                    data-pstart="${p.start}" data-preturn="${p.returnBy}"
                    style="padding:5px 12px;font-size:11.5px;min-height:34px">
              ${p.label}
            </button>
          `).join('')}
        </div>

        <!-- Precise Time Pickers -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;background:var(--panel);padding:14px 16px;border-radius:16px;border:1px solid var(--line)">
          <div>
            <label for="dial-start-select" style="font-size:11px;font-weight:800;color:var(--mu);text-transform:uppercase;display:block;margin-bottom:6px">
              🚗 Depart Graphic Era
            </label>
            <select id="dial-start-select" style="width:100%;height:40px;border-radius:12px;background:var(--card);color:var(--tx);border:1px solid var(--line);padding:0 12px;font-size:13px;font-weight:700">
              ${timeOptions.filter(o => o.min <= 1140).map(o => `
                <option value="${o.min}" ${o.min === this.start ? 'selected' : ''}>${o.label}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label for="dial-return-select" style="font-size:11px;font-weight:800;color:var(--mu);text-transform:uppercase;display:block;margin-bottom:6px">
              🏁 Back at Campus By
            </label>
            <select id="dial-return-select" style="width:100%;height:40px;border-radius:12px;background:var(--card);color:var(--tx);border:1px solid var(--line);padding:0 12px;font-size:13px;font-weight:700">
              ${timeOptions.filter(o => o.min >= 420).map(o => `
                <option value="${o.min}" ${o.min === this.returnBy ? 'selected' : ''}>${o.label}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Secondary slider for fine adjustments -->
        <div style="margin-top:14px;display:flex;gap:12px;align-items:center">
          <input type="range" id="dial-start-input" min="360" max="1200" step="15" value="${this.start}" 
                 aria-label="Fine adjust start time" style="flex:1;accent-color:var(--ac);cursor:pointer;height:6px">
          <input type="range" id="dial-return-input" min="420" max="1320" step="15" value="${this.returnBy}" 
                 aria-label="Fine adjust return time" style="flex:1;accent-color:var(--orange);cursor:pointer;height:6px">
        </div>
      </div>
    `;

    // Presets event
    container.querySelectorAll('.dial-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pStart = Number(btn.getAttribute('data-pstart'));
        const pReturn = Number(btn.getAttribute('data-preturn'));
        this.start = pStart;
        this.returnBy = pReturn;
        this.update();
        this.onChange(this.start, this.returnBy);
      });
    });

    // Dropdown change
    const startSelect = container.querySelector('#dial-start-select') as HTMLSelectElement;
    const returnSelect = container.querySelector('#dial-return-select') as HTMLSelectElement;

    startSelect.addEventListener('change', () => {
      let s = Number(startSelect.value);
      if (s >= this.returnBy - 60) {
        this.returnBy = Math.min(1380, s + 180);
      }
      this.start = s;
      this.update();
      this.onChange(this.start, this.returnBy);
    });

    returnSelect.addEventListener('change', () => {
      let r = Number(returnSelect.value);
      if (r <= this.start + 60) {
        this.start = Math.max(360, r - 180);
      }
      this.returnBy = r;
      this.update();
      this.onChange(this.start, this.returnBy);
    });

    // Slider inputs
    const startInput = container.querySelector('#dial-start-input') as HTMLInputElement;
    const returnInput = container.querySelector('#dial-return-input') as HTMLInputElement;

    startInput.addEventListener('input', () => {
      let s = Number(startInput.value);
      if (s >= this.returnBy - 30) {
        s = this.returnBy - 30;
        startInput.value = String(s);
      }
      this.start = s;
      this.update();
      this.onChange(this.start, this.returnBy);
    });

    returnInput.addEventListener('input', () => {
      let r = Number(returnInput.value);
      if (r <= this.start + 30) {
        r = this.start + 30;
        returnInput.value = String(r);
      }
      this.returnBy = r;
      this.update();
      this.onChange(this.start, this.returnBy);
    });
  }
}
