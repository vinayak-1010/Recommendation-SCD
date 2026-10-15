/**
 * DESIGN SYSTEM SHOWCASE PAGE (/design)
 * Complete visual documentation of typography, color tokens, and the 11 component primitives.
 */

export function renderDesignSystemPage(active = false): string {
  return `
    <main id="page-design" class="page-view ${active ? 'active-page' : ''}">
      <div class="page-breadcrumb-bar">
        <a href="#/home" class="btn-back-crumb">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          <span>Back to Home</span>
        </a>
        <span class="mono" style="font-size:12px;color:var(--mu)">DESIGN SYSTEM SPECIFICATION</span>
      </div>

      <div class="subpage-hero" style="margin-bottom:48px">
        <div class="subpage-hero-eyebrow">
          <span class="live-dot"></span>
          <span>Apple-Grade UI Design Tokens & Component Primitives</span>
        </div>
        <h1 class="subpage-hero-title">Design System & Token Library</h1>
        <p class="subpage-hero-desc">
          Engineered for AWS Student Community Day 2026. Preserving brand accent #AD5CFF, near-black #0A0A0C, and off-white #F5F5F7 with fluid typography clamp, tactile 3D physical buttons, and glassmorphic surfaces.
        </p>
      </div>

      <div style="display:flex;flex-direction:column;gap:56px">
        <!-- 1. COLOR TOKENS -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">1. Core Palette Tokens</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:16px">
            <div style="background:#0A0A0C;border:1px solid #232738;padding:16px;border-radius:var(--r-md)">
              <b style="color:#FFF;display:block">Near Black</b>
              <span class="mono" style="font-size:12px;color:var(--mu)">#0A0A0C (--bg)</span>
            </div>
            <div style="background:#121520;border:1px solid #232738;padding:16px;border-radius:var(--r-md)">
              <b style="color:#FFF;display:block">Surface Panel</b>
              <span class="mono" style="font-size:12px;color:var(--mu)">#121520 (--panel)</span>
            </div>
            <div style="background:#AD5CFF;padding:16px;border-radius:var(--r-md)">
              <b style="color:#FFF;display:block">Brand Accent</b>
              <span class="mono" style="font-size:12px;color:#FFF">#AD5CFF (--ac)</span>
            </div>
            <div style="background:#FF9900;padding:16px;border-radius:var(--r-md)">
              <b style="color:#FFF;display:block">AWS Amber</b>
              <span class="mono" style="font-size:12px;color:#FFF">#FF9900 (--orange)</span>
            </div>
            <div style="background:#00D492;padding:16px;border-radius:var(--r-md)">
              <b style="color:#0A0A0C;display:block">Verified Emerald</b>
              <span class="mono" style="font-size:12px;color:#0A0A0C">#00D492 (--ok)</span>
            </div>
            <div style="background:#F5F5F7;padding:16px;border-radius:var(--r-md)">
              <b style="color:#0A0A0C;display:block">Off-White Pure</b>
              <span class="mono" style="font-size:12px;color:#0A0A0C">#F5F5F7 (--tx-light)</span>
            </div>
          </div>
        </section>

        <!-- 2. BUTTONS -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">2. Physical Tactile & Glass Buttons</h2>
          <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
            <button class="btn-apple-primary">Primary Apple (#AD5CFF)</button>
            <button class="btn-apple-orange">Orange Tactile (#FF9900)</button>
            <button class="btn-apple-secondary">Secondary Glass Panel</button>
            <button class="btn-apple-ghost">Ghost Text Button</button>
            <button class="btn-apple-icon" aria-label="Icon Demo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </section>

        <!-- 3. CHIPS & BADGES -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">3. Chips, Badges & Pills</h2>
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
            <span class="filter-chip active">Active Filter Chip</span>
            <span class="filter-chip">Inactive Filter Chip</span>
            <span class="badge-apple-pill verified">✓ 100% Verified Place</span>
            <span class="badge-apple-pill warning">⚠️ Mountain Weather Warning</span>
            <span class="badge-apple-pill" style="color:var(--ac);border-color:rgba(173,92,255,0.4)">AWS Community Day 2026</span>
          </div>
        </section>

        <!-- 4. CARDS & BENTO SURFACES -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">4. Glassmorphic Bento Cards</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px">
            <div class="card-apple-glass card-apple-interactive" style="padding:20px">
              <span style="font-size:24px">🏔️</span>
              <h4 style="font-size:16px;font-weight:800;color:var(--tx);margin:8px 0 4px">Interactive Hover Surface</h4>
              <p style="font-size:13px;color:var(--t2)">Smooth spring lift with Apple cubic-bezier(0.22, 1, 0.36, 1) ease.</p>
            </div>
            <div class="card-apple-glass" style="padding:20px">
              <span style="font-size:24px">🛡️</span>
              <h4 style="font-size:16px;font-weight:800;color:var(--tx);margin:8px 0 4px">Static Glass Enclosure</h4>
              <p style="font-size:13px;color:var(--t2)">Backdrop blur 20px with 1px border light bleed.</p>
            </div>
          </div>
        </section>

        <!-- 5. TABS & SEGMENTED CONTROLS -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">5. iOS Segmented Switcher</h2>
          <div class="segmented" style="max-width:380px">
            <label><input type="radio" name="demo-seg" checked><span>Event Day</span></label>
            <label><input type="radio" name="demo-seg"><span>Sightseeing</span></label>
            <label><input type="radio" name="demo-seg"><span>Nightlife</span></label>
          </div>
        </section>

        <!-- 6. TOOLTIP & TOAST -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">6. Tooltip & Toast Notifications</h2>
          <div style="display:flex;align-items:center;gap:20px">
            <span class="tooltip-apple" data-tooltip="Verified by Graphic Era Team">
              <button class="scd-btn-3d-secondary">Hover for Apple Tooltip</button>
            </span>
            <button class="scd-btn-3d-primary" id="btn-demo-toast">Trigger Toast Notification</button>
          </div>
        </section>

        <!-- 7. SKELETON SHIMMER -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">7. Skeleton Loading Shimmer</h2>
          <div style="display:flex;flex-direction:column;gap:12px;max-width:440px">
            <div class="skeleton-apple-shimmer" style="height:24px;width:70%"></div>
            <div class="skeleton-apple-shimmer" style="height:14px;width:100%"></div>
            <div class="skeleton-apple-shimmer" style="height:14px;width:85%"></div>
          </div>
        </section>

        <!-- 8. TIMELINE -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">8. Route Step Timeline</h2>
          <div class="timeline-apple" style="max-width:440px">
            <div class="timeline-item">
              <div class="timeline-bullet">1</div>
              <b style="color:var(--tx)">Graphic Era Clement Town</b>
              <p style="font-size:12px;color:var(--mu);margin:2px 0 0">Depart 08:00 AM · Conference Base</p>
            </div>
            <div class="timeline-item">
              <div class="timeline-bullet">2</div>
              <b style="color:var(--tx)">Mindrolling Monastery Stupa</b>
              <p style="font-size:12px;color:var(--mu);margin:2px 0 0">Arrive 08:15 AM · 45 mins dwell</p>
            </div>
            <div class="timeline-item">
              <div class="timeline-bullet">3</div>
              <b style="color:var(--tx)">Landour Sisters' Bazaar</b>
              <p style="font-size:12px;color:var(--mu);margin:2px 0 0">Arrive 10:45 AM · 2,290m altitude</p>
            </div>
          </div>
        </section>

        <!-- 9. MAP MARKER -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">9. Leaflet Neon Pin Markers</h2>
          <div style="display:flex;align-items:center;gap:24px">
            <div style="display:flex;align-items:center;gap:8px">
              <div class="neon-pin-wrap neon-pin-origin">🏛️</div>
              <span style="font-size:13px;color:var(--tx)">Origin Marker</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="neon-pin-wrap">1</div>
              <span style="font-size:13px;color:var(--tx)">Waypoint 1</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="neon-pin-wrap">2</div>
              <span style="font-size:13px;color:var(--tx)">Waypoint 2</span>
            </div>
          </div>
        </section>

        <!-- 10. STAT COUNTERS -->
        <section class="card-apple-glass" style="padding:28px 32px">
          <h2 style="font-size:20px;font-weight:900;color:var(--tx);margin-bottom:16px">10. Apple Tabular Stat Counters</h2>
          <div style="display:flex;gap:40px;flex-wrap:wrap">
            <div class="stat-counter-apple">
              <span class="stat-counter-val gradient-text">2,290m</span>
              <span class="stat-counter-label">Max Ridge Summit</span>
            </div>
            <div class="stat-counter-apple">
              <span class="stat-counter-val gradient-orange">25</span>
              <span class="stat-counter-label">Curated Dossiers</span>
            </div>
            <div class="stat-counter-apple">
              <span class="stat-counter-val" style="color:#00D492">0</span>
              <span class="stat-counter-label">Backtracking Km</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  `;
}

export function showToast(message: string, durationMs = 3000) {
  let toast = document.getElementById('global-toast') as HTMLElement;
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-apple';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span style="font-size:18px">✨</span>
    <span>${message}</span>
  `;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, durationMs);
}
