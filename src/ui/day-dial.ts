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
    const readout = document.getElementById('dial-usable-readout');
    if (readout) {
      readout.innerHTML = `<span>${this.formatDuration(usable)}</span> usable (${this.formatTime(this.start)} – ${this.formatTime(this.returnBy)})`;
    }

    const startInput = document.getElementById('dial-start-input') as HTMLInputElement;
    const returnInput = document.getElementById('dial-return-input') as HTMLInputElement;
    if (startInput) startInput.value = String(this.start);
    if (returnInput) returnInput.value = String(this.returnBy);
  }

  public render(container: HTMLElement) {
    const daylight = calculateDaylight(this.dateStr);
    const usable = Math.max(0, this.returnBy - this.start);

    // 5 AM (300m) to 11 PM (1380m) = 1080m range
    const sunsetPercent = Math.max(0, Math.min(100, ((daylight.sunset - 300) / 1080) * 100));

    container.innerHTML = `
      <div class="dial-container">
        <div class="dial-header">
          <span style="font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--mu)">Trip Window</span>
          <div class="dial-readout" id="dial-usable-readout">
            <span>${this.formatDuration(usable)}</span> usable (${this.formatTime(this.start)} – ${this.formatTime(this.returnBy)})
          </div>
        </div>

        <div class="dial-track-wrapper">
          <div class="dial-heat-strip"></div>
          <div class="dial-sunset-marker" style="left:${sunsetPercent}%">
            <span>Sunset ${this.formatTime(daylight.sunset)}</span>
          </div>

          <div style="display:flex;width:100%;gap:12px;position:relative;z-index:2">
            <div style="flex:1">
              <label style="font-size:11px;font-weight:700;color:var(--mu);display:block;margin-bottom:4px">Start Campus</label>
              <input type="range" id="dial-start-input" min="300" max="1320" step="15" value="${this.start}" style="width:100%;accent-color:var(--ac);cursor:pointer">
            </div>
            <div style="flex:1">
              <label style="font-size:11px;font-weight:700;color:var(--mu);display:block;margin-bottom:4px">Return By</label>
              <input type="range" id="dial-return-input" min="360" max="1380" step="15" value="${this.returnBy}" style="width:100%;accent-color:var(--ac);cursor:pointer">
            </div>
          </div>
        </div>
      </div>
    `;

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
