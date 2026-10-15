/**
 * APPLE-GRADE CINEMATIC LANDING EXPERIENCE
 * AWS Student Community Day 2026 · Graphic Era University, Dehradun
 */

import { EVENT_META, THE_WHY, THE_PROMISE, THREE_WORLDS, STORY_CHAPTERS } from '../../content/story.ts';
import routesData from '../../content/routes.json';
import { fetchLiveWeather, WeatherTelemetry } from './weather.ts';
import { resolveImg } from './app.ts';

export function renderCinematicLanding(): string {
  return `
    <!-- SECTION 1: CINEMATIC HERO (Pinned 100svh) -->
    <section class="cinematic-section hero-cinematic" id="hero-cinematic">
      <div class="hero-parallax-bg">
        <div class="mist-layer mist-layer-1"></div>
        <div class="mist-layer mist-layer-2"></div>
      </div>

      <div class="cinematic-hero-content">
        <div class="apple-hero-badge">
          <span class="live-dot"></span>
          <span>${EVENT_META.name} · Clement Town, Dehradun</span>
        </div>

        <h1 class="cinematic-hero-headline" aria-label="Come for the code. Stay for the mountains.">
          <span class="stagger-word" style="animation-delay: 0.1s">Come</span>
          <span class="stagger-word" style="animation-delay: 0.2s">for</span>
          <span class="stagger-word" style="animation-delay: 0.3s">the</span>
          <span class="stagger-word gradient-text" style="animation-delay: 0.4s">code.</span><br>
          <span class="stagger-word" style="animation-delay: 0.5s">Stay</span>
          <span class="stagger-word" style="animation-delay: 0.6s">for</span>
          <span class="stagger-word" style="animation-delay: 0.7s">the</span>
          <span class="stagger-word gradient-orange" style="animation-delay: 0.8s">mountains.</span>
        </h1>

        <p class="cinematic-hero-sub">
          Hosted by Graphic Era (Deemed to be University). An intelligent, daylight-safe expedition guide engineered for visiting speakers, builders, and delegates who want to experience the true soul of Uttarakhand with zero backtracking.
        </p>

        <!-- Live Telemetry Island -->
        <div class="apple-telemetry-island" id="live-telemetry-island">
          <div class="telemetry-item">
            <span>📍</span>
            <span>Base: <b>Graphic Era Campus</b></span>
          </div>
          <div class="telemetry-sep"></div>
          <div class="telemetry-item">
            <span>🌡️</span>
            <span id="telemetry-temp">Valley <b>24°C</b> · Ridge <b>18°C</b></span>
          </div>
          <div class="telemetry-sep"></div>
          <div class="telemetry-item">
            <span>⛰️</span>
            <span>Summit: <b>2,290m</b> Lal Tibba</span>
          </div>
          <div class="telemetry-sep"></div>
          <div class="telemetry-item">
            <span>☀️</span>
            <span style="color:#FFA726" id="telemetry-sunset">Sunset <b>5:34 PM</b> (Daylight Sentinel)</span>
          </div>
        </div>

        <!-- Action CTAs -->
        <div class="apple-hero-actions">
          <a href="#the-why-section" class="scd-btn-3d-primary" id="hero-explore-btn">
            <span>The Story of Us</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </a>
          <a href="#/planner" class="scd-btn-3d-orange">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span>Launch Route Planner</span>
          </a>
          <button class="scd-btn-3d-secondary" id="btn-open-transit-drawer">
            <span>🧳 Transit & Safety Guide</span>
          </button>
        </div>

        <!-- Scroll Cue -->
        <div class="scroll-cue" aria-hidden="true">
          <div class="scroll-pill">
            <div class="scroll-dot"></div>
          </div>
          <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--mu);margin-top:6px">Scroll to explore</span>
        </div>
      </div>
    </section>

    <!-- SECTION 2: THE WHY (Word-by-word Scroll Lighting) -->
    <section class="cinematic-section the-why-section" id="the-why-section">
      <div class="the-why-container">
        <span class="badge-apple-pill" style="color:var(--ac);border-color:rgba(173,92,255,0.3);margin-bottom:20px;display:inline-flex">
          ${THE_WHY.eyebrow}
        </span>
        <h2 class="the-why-heading">${THE_WHY.heading}</h2>

        <div class="the-why-paragraph" id="scroll-lit-paragraph" aria-label="${THE_WHY.paragraphWords.join(' ')}">
          ${THE_WHY.paragraphWords.map(word => `<span class="word-lighting-char">${word}</span>`).join(' ')}
        </div>

        <div style="margin-top:40px;display:flex;align-items:center;gap:16px;color:var(--t2);font-size:14px">
          <span>— The Students of Graphic Era Community</span>
          <span style="color:var(--ac)">•</span>
          <span class="mono" style="color:var(--mu)">Clement Town, Dehradun</span>
        </div>
      </div>
    </section>

    <!-- SECTION 3: THE PROMISE (Three Full-Screen Beats with Animated Diagrams) -->
    <section class="cinematic-section the-promise-section" id="the-promise-section">
      <div class="section-hero-heading" style="margin-bottom:48px">
        <span class="badge-apple-pill" style="color:#FFA726;border-color:rgba(255,167,38,0.3);margin-bottom:12px;display:inline-flex">
          ENGINEERING ARCHITECTURE
        </span>
        <h2>Three Non-Negotiable Guarantees</h2>
        <p>Built with graph algorithms and local mountain intelligence so you never miss a session or get trapped in hill fog.</p>
      </div>

      <div class="promise-beats-grid">
        <!-- Beat 1: No Backtracking -->
        <div class="promise-beat-card">
          <div class="promise-beat-diagram">
            <svg viewBox="0 0 160 100" class="mini-diagram-svg">
              <defs>
                <linearGradient id="grad-arrow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#AD5CFF"/>
                  <stop offset="100%" stop-color="#FF9900"/>
                </linearGradient>
              </defs>
              <path d="M 20 80 C 40 20, 120 20, 140 80" fill="none" stroke="url(#grad-arrow)" stroke-width="4" stroke-dasharray="6 4" class="anim-dash"/>
              <circle cx="20" cy="80" r="7" fill="#AD5CFF"/>
              <circle cx="80" cy="35" r="7" fill="#FFA726"/>
              <circle cx="140" cy="80" r="7" fill="#00D492"/>
              <path d="M 136 70 L 144 80 L 132 84" fill="none" stroke="#00D492" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="promise-num">01</div>
          <h3 class="promise-title">No backtracking.</h3>
          <p class="promise-desc">
            Graph-computed single-direction loops. Every route flows continuously so you never waste precious weekend hours stuck in Doon or Rajpur choke points.
          </p>
          <span class="chip verified" style="margin-top:auto">Topological Sort Verified</span>
        </div>

        <!-- Beat 2: Home before dark -->
        <div class="promise-beat-card">
          <div class="promise-beat-diagram">
            <svg viewBox="0 0 160 100" class="mini-diagram-svg">
              <path d="M 15 85 L 145 85" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
              <path d="M 25 85 A 55 55 0 0 1 135 85" fill="none" stroke="#FFA726" stroke-width="3" stroke-dasharray="4 3"/>
              <circle cx="80" cy="30" r="12" fill="#FFA726" filter="drop-shadow(0 0 8px rgba(255,167,38,0.8))"/>
              <path d="M 80 10 L 80 18 M 58 40 L 52 42 M 102 40 L 108 42" stroke="#FFA726" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="promise-num">02</div>
          <h3 class="promise-title">Home before dark.</h3>
          <p class="promise-desc">
            Real astronomical sunset calculations. Hill descents are hard-capped to return you before mountain fog rolls over the hairpin bends of the Shivaliks.
          </p>
          <span class="chip" style="margin-top:auto;background:rgba(255,167,38,0.15);color:#FFA726;border-color:rgba(255,167,38,0.3)">
            Astronomical Guard (5:34 PM)
          </span>
        </div>

        <!-- Beat 3: Local, not touristy -->
        <div class="promise-beat-card">
          <div class="promise-beat-diagram">
            <svg viewBox="0 0 160 100" class="mini-diagram-svg">
              <circle cx="80" cy="50" r="32" fill="none" stroke="#AD5CFF" stroke-width="1.5" stroke-opacity="0.3" class="anim-pulse"/>
              <circle cx="80" cy="50" r="20" fill="none" stroke="#AD5CFF" stroke-width="2" stroke-opacity="0.6"/>
              <circle cx="80" cy="50" r="8" fill="#AD5CFF"/>
              <path d="M 80 58 L 80 82" stroke="#AD5CFF" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="promise-num">03</div>
          <h3 class="promise-title">Local, not touristy.</h3>
          <p class="promise-desc">
            Curated by students who live here. 1953 colonial bakeries, roadside cheese Maggi overlooking twilight valleys, and secluded monastery gardens away from tourist traps.
          </p>
          <span class="chip verified" style="margin-top:auto">Graphic Era Student Picks</span>
        </div>
      </div>
    </section>

    <!-- SECTION 4: THREE WORLDS (Horizontal Scroll Gallery & Micro-Climates) -->
    <section class="cinematic-section three-worlds-section" id="three-worlds-section">
      <div class="section-hero-heading" style="margin-bottom:32px">
        <span class="badge-apple-pill" style="color:#60A5FA;border-color:rgba(96,165,250,0.3);margin-bottom:12px;display:inline-flex">
          TERRAIN EXPEDITION ATLAS
        </span>
        <h2>Three Distinct Worlds</h2>
        <p>From the serene base at Clement Town to the alpine peaks and the holy Himalayan riverbanks.</p>
      </div>

      <div class="three-worlds-gallery">
        ${THREE_WORLDS.map(world => `
          <div class="world-card" style="--zone-color: ${world.accentColor}">
            <div class="world-card-media">
              <img src="${resolveImg(world.image)}" alt="${world.zone}" onerror="this.src='scd images/${world.image}'">
              <div class="world-card-overlay">
                <span class="world-spots-badge">${world.spotsCount}</span>
                <span class="world-alt-badge">${world.altitude}</span>
              </div>
            </div>
            <div class="world-card-body">
              <div class="world-header-row">
                <span class="world-sub-tag">${world.sub}</span>
                <span class="mono" style="font-size:12px;color:var(--mu)">${world.distance}</span>
              </div>
              <h3 class="world-title">${world.zone}</h3>
              <p class="world-lead">${world.lead}</p>
              <div class="world-footer">
                <a href="${world.targetHash}" class="scd-btn-3d-secondary" style="width:100%;justify-content:center">
                  <span>Explore ${world.zone} Dossiers →</span>
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECTION 5: CURATED ROUTE CARDS (Pre-Filled Flow into Planner) -->
    <section class="cinematic-section routes-showcase-section" id="routes-showcase-section">
      <div class="section-hero-heading" style="margin-bottom:36px">
        <span class="badge-apple-pill" style="color:var(--ac);border-color:rgba(173,92,255,0.3);margin-bottom:12px;display:inline-flex">
          PRECISION BLUEPRINTS
        </span>
        <h2>Six Master Curated Routes</h2>
        <p>Each route features verified leave-by times, elevation profiles, and one-tap loading into our custom itinerary engine.</p>
      </div>

      <div class="curated-routes-grid">
        ${(routesData as any[]).map(route => `
          <div class="curated-route-card">
            <div class="route-card-banner">
              <img src="${resolveImg(route.coverImage)}" alt="${route.title}" onerror="this.src='scd images/${route.coverImage}'">
              <div class="route-banner-overlay">
                <span class="route-badge-pill">${route.badge}</span>
                <span class="route-duration-pill">⏱️ ${route.durationHours} Hours</span>
              </div>
            </div>

            <div class="route-card-body">
              <h3 class="route-card-title">${route.title}</h3>
              <p class="route-card-sub">${route.subtitle}</p>

              <div class="route-telemetry-strip">
                <div class="route-telemetry-bit">
                  <span style="font-size:11px;color:var(--mu);text-transform:uppercase;font-weight:800">Leave By</span>
                  <b style="font-size:12.5px;color:#FFA726">${route.leaveBy}</b>
                </div>
                <div class="route-telemetry-bit">
                  <span style="font-size:11px;color:var(--mu);text-transform:uppercase;font-weight:800">Transport</span>
                  <b style="font-size:12.5px;color:var(--tx)">${route.recommendedTransport.toUpperCase()}</b>
                </div>
              </div>

              <p class="route-description-text">${route.description}</p>

              <div class="route-reasoning-box">
                <span style="font-size:11px;font-weight:800;color:var(--ac);text-transform:uppercase">Why This Order:</span>
                <p style="font-size:12px;color:var(--t2);margin:4px 0 0">${route.whyThisOrder}</p>
              </div>

              <div class="route-sunset-notice">
                <span>☀️</span>
                <span>${route.sunsetNotice}</span>
              </div>

              <div class="route-action-row" style="margin-top:16px">
                <button class="scd-btn-3d-orange btn-load-curated-route" data-route-id="${route.id}" style="width:100%;justify-content:center">
                  <span>Load into Planner 2.0 →</span>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SECTION 6: PRACTICAL STRIP (Live Weather, Sunset & Getting-There) -->
    <section class="cinematic-section practical-strip-section" id="practical-strip-section">
      <div class="practical-strip-inner card-apple-glass" style="padding:32px 36px">
        <div class="practical-strip-header">
          <div>
            <span class="badge-apple-pill verified" style="margin-bottom:8px">LIVE TELEMETRY & ADVISORY</span>
            <h3 style="font-size:24px;font-weight:900;color:var(--tx)">Doon Valley & Landour Ridge Conditions</h3>
          </div>
          <button class="scd-btn-3d-secondary" id="btn-practical-drawer-trigger">
            <span>View All Transit & Safety FAQs</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <div class="practical-telemetry-grid">
          <div class="telemetry-box">
            <span class="telemetry-box-icon">🌡️</span>
            <div>
              <div class="telemetry-box-label">Valley Temperature</div>
              <div class="telemetry-box-value" id="val-valley-temp">24°C (Comfortable)</div>
            </div>
          </div>

          <div class="telemetry-box">
            <span class="telemetry-box-icon">⛰️</span>
            <div>
              <div class="telemetry-box-label">Landour Ridge (2,290m)</div>
              <div class="telemetry-box-value" id="val-ridge-temp">18°C (Cool Alpine)</div>
            </div>
          </div>

          <div class="telemetry-box">
            <span class="telemetry-box-icon">🌅</span>
            <div>
              <div class="telemetry-box-label">Daylight Sentinel</div>
              <div class="telemetry-box-value" id="val-sunset-time">Sunset 5:34 PM</div>
            </div>
          </div>

          <div class="telemetry-box">
            <span class="telemetry-box-icon">🎒</span>
            <div>
              <div class="telemetry-box-label">Live Packing Advice</div>
              <div class="telemetry-box-value" id="val-packing-hint" style="font-size:12.5px">Carry a light fleece for evening ridge walks.</div>
            </div>
          </div>
        </div>

        <div class="practical-transit-chips-row">
          <div class="transit-chip-bit">
            <span>✈️ <b>Jolly Grant Airport (DED)</b>: 32 km (~60 min cab to campus)</span>
          </div>
          <div class="transit-chip-bit">
            <span>🚆 <b>Dehradun Railway (DDN)</b>: 6.8 km (~20 min auto to campus)</span>
          </div>
          <div class="transit-chip-bit">
            <span>🚨 <b>Uttarakhand Emergency Helpline</b>: Dial 112 (Police, Medical, Fire)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 7: CLOSING BEAT & MAGNETIC CTA -->
    <section class="cinematic-section closing-beat-section" id="closing-beat-section">
      <div class="closing-beat-content">
        <span class="badge-apple-pill" style="color:var(--ac);border-color:rgba(173,92,255,0.4);margin-bottom:20px;display:inline-flex">
          AWS STUDENT COMMUNITY DAY 2026
        </span>

        <h2 class="closing-huge-motto">
          Build in the cloud.<br>
          <span class="gradient-text">Wander in the clouds.</span>
        </h2>

        <p class="closing-sub">
          Craft your customized expedition around Dehradun, Mussoorie, and the Himalayan foothills with our daylight-safe, zero-backtracking engine.
        </p>

        <div class="closing-magnetic-wrap">
          <a href="#/planner" class="scd-btn-3d-orange magnetic-cta-btn" id="magnetic-plan-cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span style="font-size:16px">Plan My Trip Now</span>
          </a>
        </div>

        <div style="margin-top:36px;font-size:13px;color:var(--mu)">
          Hosted with pride by Graphic Era (Deemed to be University) · Clement Town, Dehradun
        </div>
      </div>
    </section>
  `;
}

/**
 * Interactive initializers for Cinematic Landing Page
 */
export function initCinematicInteractions(rootEl: HTMLElement, onSelectRoute?: (routeId: string) => void) {
  // 1. Live Weather Fetch
  fetchLiveWeather().then(weather => {
    updateWeatherUI(rootEl, weather);
  }).catch(() => {
    // Graceful offline fallback
  });

  // 2. Word-by-word scroll lighting for Section 2
  initWordLighting(rootEl);

  // 3. Scroll progress line
  initScrollProgress();

  // 4. Desktop Custom Cursor
  initCustomCursor();

  // 5. Curated route card triggers
  rootEl.querySelectorAll('.btn-load-curated-route').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const routeId = (btn as HTMLElement).getAttribute('data-route-id');
      if (routeId && onSelectRoute) {
        onSelectRoute(routeId);
      }
    });
  });

  // 6. Magnetic CTA effect on Section 7 button
  initMagneticButton(rootEl);
}

function updateWeatherUI(rootEl: HTMLElement, weather: WeatherTelemetry) {
  const telemetryTemp = rootEl.querySelector('#telemetry-temp');
  if (telemetryTemp) {
    telemetryTemp.innerHTML = `Valley <b>${weather.valleyTemp}°C</b> · Ridge <b>${weather.ridgeTemp}°C</b>`;
  }
  const telemetrySunset = rootEl.querySelector('#telemetry-sunset');
  if (telemetrySunset) {
    telemetrySunset.innerHTML = `Sunset <b>${weather.sunsetTime}</b> (Daylight Sentinel)`;
  }
  const valValley = rootEl.querySelector('#val-valley-temp');
  if (valValley) valValley.textContent = `${weather.valleyTemp}°C (${weather.valleyTemp > 22 ? 'Pleasant' : 'Crisp'})`;
  const valRidge = rootEl.querySelector('#val-ridge-temp');
  if (valRidge) valRidge.textContent = `${weather.ridgeTemp}°C (Cool Alpine)`;
  const valSunset = rootEl.querySelector('#val-sunset-time');
  if (valSunset) valSunset.textContent = `Sunset ${weather.sunsetTime}`;
  const valPacking = rootEl.querySelector('#val-packing-hint');
  if (valPacking) valPacking.textContent = weather.packingAdvice;
}

function initWordLighting(rootEl: HTMLElement) {
  const paragraphEl = rootEl.querySelector('#scroll-lit-paragraph');
  if (!paragraphEl) return;

  const words = paragraphEl.querySelectorAll('.word-lighting-char');
  if (!words.length) return;

  const onScroll = () => {
    const rect = paragraphEl.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Calculate progress through section
    const progress = Math.max(0, Math.min(1, (windowH * 0.85 - rect.top) / (rect.height + windowH * 0.5)));
    const targetIdx = Math.floor(progress * words.length);

    words.forEach((w, i) => {
      w.classList.toggle('lit', i <= targetIdx);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initScrollProgress() {
  let bar = document.getElementById('scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress-bar';
    document.body.appendChild(bar);
  }

  const update = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (bar) bar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initCustomCursor() {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let dot = document.querySelector('.custom-cursor-dot') as HTMLElement;
  let ring = document.querySelector('.custom-cursor-ring') as HTMLElement;

  if (!dot) {
    dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(ring);
  }

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  const renderRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(renderRing);
  };
  requestAnimationFrame(renderRing);

  document.querySelectorAll('a, button, input, select, label').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%, -50%) scale(1.6)';
      ring.style.borderColor = '#FF9900';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.borderColor = 'rgba(173, 92, 255, 0.5)';
    });
  });
}

function initMagneticButton(rootEl: HTMLElement) {
  const btn = rootEl.querySelector('#magnetic-plan-cta') as HTMLElement;
  if (!btn) return;

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0px, 0px)';
  });
}
