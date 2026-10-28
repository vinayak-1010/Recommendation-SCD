/**
 * VISITOR-FIRST EDITORIAL LANDING PAGE (VISIT ABU DHABI & MAKEMYTRIP TRAVEL PORTAL CALIBER)
 * AWS Student Community Day 2026 · Explore Doon × Mussoorie
 * Retains dark luxury palette: Deep space #0A0A0C, SCD violet #AD5CFF, AWS orange #FF9900, emerald #00D492
 */
import { resolveImg } from './app.ts';

export function renderCinematicLanding(): string {
  return `
    <!-- 1. EDITORIAL HERO WITH LIVE ALPINE PULSE & MAKEMYTRIP QUICK PLANNER -->
    <section class="visitor-hero" aria-labelledby="visitor-title">
      <img class="visitor-hero-image" src="${resolveImg('lal-tibba.webp')}" alt="Himalayan snow range seen from Lal Tibba in Landour" fetchpriority="high">
      <div class="visitor-hero-shade"></div>
      
      <div class="visitor-hero-copy">
        <div class="visitor-kicker">
          <span class="live-dot"></span>
          <span>OFFICIAL VISITOR PORTAL · EXPLORE DOON × MUSSOORIE</span>
        </div>
        
        <h1 id="visitor-title">
          Stories from the Foothills.<br>
          <span>Curated Trails & Roaming Studio.</span>
        </h1>
        
        <p class="visitor-hero-lead">
          From the tranquil cloisters of Mindrolling and the knee-deep river gorge of Robber’s Cave to 2,290m pine-scented colonial ridges of Landour and Himalayan winterline sunsets. Crafted for AWS Community Day builders, solo roamers, and group expeditions.
        </p>

        <!-- Live Weather & Mountain Pulse Ticker (Visit Abu Dhabi Style) -->
        <div class="live-alpine-ticker">
          <div class="ticker-pill">
            <span class="pulse-indicator"></span>
            <span>🌡️ Dehradun 22°C Clear</span>
          </div>
          <div class="ticker-divider"></div>
          <div class="ticker-pill">
            <span>⛰️ Lal Tibba 16°C Alpine Breeze</span>
          </div>
          <div class="ticker-divider"></div>
          <div class="ticker-pill">
            <span>🌅 Winterline Sunset: <b>5:34 PM</b></span>
          </div>
          <div class="ticker-divider"></div>
          <div class="ticker-pill" style="color:#00D492">
            <span>✓ Daylight Guard Active</span>
          </div>
        </div>

        <!-- SENIOR TRAVEL PLANNER / MAKEMYTRIP SMART TRIP MATCHER CARD -->
        <div class="smart-trip-matcher-card">
          <div class="matcher-header">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:16px">🧭</span>
              <span class="mono" style="font-size:12px;font-weight:800;letter-spacing:0.06em;color:var(--tx)">FAST TRAVEL MATCHER</span>
            </div>
            <span style="font-size:11px;color:var(--mu)">MakeMyTrip-Grade Intelligent Routing</span>
          </div>

          <div class="matcher-fields-grid">
            <div class="matcher-field">
              <label for="home-window-select">⏱️ Time Window</label>
              <select id="home-window-select" class="matcher-select">
                <option value="2h">⚡ 2 Hours (Local Walk & Stupa)</option>
                <option value="4h">🌤️ 4 Hours (Valley Caves & Nature)</option>
                <option value="8h" selected>⛰️ Full Day (Mussoorie & Landour Ridge)</option>
                <option value="2d">🌄 2 Days (Doon + Himalayan Outskirts)</option>
              </select>
            </div>

            <div class="matcher-field">
              <label for="home-party-select">👥 Travelers (N People)</label>
              <select id="home-party-select" class="matcher-select">
                <option value="1">👤 1 Person (Solo Explorer)</option>
                <option value="2">👥 2 People (Pair / Couple)</option>
                <option value="4" selected>🚙 4 Friends (Sedan / Cab)</option>
                <option value="6">🚐 6 People (Innova / SUV)</option>
                <option value="10">🚌 10+ People (Tempo Traveller)</option>
              </select>
            </div>

            <div class="matcher-field">
              <label for="home-transport-select">🚗 Transit Mode</label>
              <select id="home-transport-select" class="matcher-select">
                <option value="car" selected>🚗 Private Cab / Car</option>
                <option value="bike">🛵 Scooty / Two-Wheeler</option>
                <option value="walk">🚶 Walk / Shared Auto</option>
              </select>
            </div>

            <div class="matcher-field matcher-cta-field">
              <button type="button" id="btn-home-match-route" class="scd-btn-3d-primary" style="width:100%;height:100%;justify-content:center">
                <span>Plan Route Now ↗</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Instant Search & Tag Filter Bar (Visit Abu Dhabi Style) -->
        <div class="visitor-search-wrap">
          <div class="visitor-search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="search" id="home-search-input" placeholder="Search 30+ destinations, waterfalls, ridge viewpoints, or bakeries..." autocomplete="off">
            <button type="button" id="home-search-clear" style="display:none" aria-label="Clear search">✕</button>
          </div>
          <div class="visitor-search-pills">
            <span class="mono" style="font-size:11px;color:rgba(255,255,255,0.6)">Quick Jump:</span>
            <button type="button" class="home-jump-pill" data-jump="land">Lal Tibba (2,290m)</button>
            <button type="button" class="home-jump-pill" data-jump="rob">Robber's Cave</button>
            <button type="button" class="home-jump-pill" data-jump="mind">Mindrolling Stupa</button>
            <button type="button" class="home-jump-pill" data-jump="geo">Sir George Everest</button>
            <button type="button" class="home-jump-pill" data-jump="fri">FRI Colonnades</button>
            <button type="button" class="home-jump-pill" data-jump="maldevta">Song River Maldevta</button>
          </div>
        </div>

        <div class="visitor-hero-note">
          <span>Starting Anchor</span>
          <b>Graphic Era · Clement Town (650m)</b>
          <span class="visitor-note-divider"></span>
          <span>Ascending to Landour Summit (2,290m)</span>
          <span class="visitor-note-divider"></span>
          <span style="color:#00D492">✓ Daylight Guard Feasibility Active</span>
        </div>
      </div>
      
      <div class="visitor-image-caption">
        <span>01 / 04</span>
        <span>Himalayan Vista · Lal Tibba Peak (2,290m)</span>
      </div>
    </section>

    <!-- 2. QUICK WINDOW PRESETS (2h / Half-Day / Full-Day) -->
    <section class="visitor-start-section" aria-labelledby="visitor-start-title">
      <div class="visitor-section-heading">
        <div>
          <div class="visitor-eyebrow">CHOOSE BY AVAILABLE TIME</div>
          <h2 id="visitor-start-title">Pick your kind of day.</h2>
        </div>
        <p>Each option loads an algorithmically verified round-trip plan in the planner with guaranteed daylight return.</p>
      </div>
      <div class="visitor-route-grid">
        <button class="visitor-route-card" data-fast-track="2" type="button">
          <span class="visitor-route-index">01 <span>· 2 HOURS</span></span>
          <span class="visitor-route-title">A Little Doon</span>
          <span class="visitor-route-detail">Quiet walk · Mindrolling Monastery & Tibetan Stupa right by campus (Zero Travel)</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="visitor-route-card" data-fast-track="4" type="button">
          <span class="visitor-route-index">02 <span>· HALF DAY (4H)</span></span>
          <span class="visitor-route-title">Valley Nature & Streams</span>
          <span class="visitor-route-detail">Wade inside Robber's Cave gorge or explore Sahastradhara springs & Rajpur cafés</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="visitor-route-card" data-fast-track="8" type="button">
          <span class="visitor-route-index">03 <span>· FULL DAY (8H)</span></span>
          <span class="visitor-route-title">The Mussoorie & Landour Ridge</span>
          <span class="visitor-route-detail">2,290m Lal Tibba, Char Dukan pancakes, Mall Road & safe descent before dusk</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
      <p class="visitor-route-footnote">
        Hill roads experience weekend congestion. Explore Doon builds in a mandatory 45-minute return buffer to keep your journey stress-free.
      </p>
    </section>

    <!-- 3. VISIT ABU DHABI-STYLE ARTICLE HUB: STICKY CATEGORY RAIL -->
    <section class="visitor-explore-section" aria-labelledby="visitor-explore-title">
      <div class="visitor-section-heading">
        <div>
          <div class="visitor-eyebrow">VISIT ABU DHABI EDITORIAL HUB</div>
          <h2 id="visitor-explore-title">Curated Stories & Roaming Destinations</h2>
        </div>
        <p>Filter by atmosphere or explore our asymmetric editorial story cards with elevation, visit times, and instant directions.</p>
      </div>

      <!-- Horizontal Editorial Category Rail -->
      <nav class="editorial-category-rail" id="home-category-rail" aria-label="Editorial Categories">
        <button type="button" class="editorial-cat-pill active" data-home-cat="all">
          <span>✨</span> All Stories & Places
        </button>
        <button type="button" class="editorial-cat-pill" data-home-cat="valleys">
          <span>💧</span> Waterfalls & Gorges
        </button>
        <button type="button" class="editorial-cat-pill" data-home-cat="ridges">
          <span>⛰️</span> Cloud Ridges & Summits
        </button>
        <button type="button" class="editorial-cat-pill" data-home-cat="heritage">
          <span>🛕</span> Sanctuaries & Heritage
        </button>
        <button type="button" class="editorial-cat-pill" data-home-cat="cafes">
          <span>☕</span> Sourdough & Bakeries
        </button>
        <button type="button" class="editorial-cat-pill" data-home-cat="outskirts">
          <span>🌲</span> Outskirts & Excursions
        </button>
        <button type="button" class="editorial-cat-pill" data-home-cat="guides">
          <span>🧭</span> Practical Travel Guides
        </button>
      </nav>

      <!-- Asymmetric Bento Editorial Grid -->
      <div class="visitor-destination-grid" id="home-destination-grid"></div>

      <div style="display:flex;justify-content:center;margin-top:28px">
        <a href="#/directory" class="visitor-text-link visitor-all-places-link">
          Browse Complete 30+ Place & Food Directory <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>

    <!-- 4. SIGNATURE CURATED BLUEPRINTS (THEMED ITINERARIES) -->
    <section class="visitor-curated-section" aria-labelledby="visitor-curated-title">
      <div class="visitor-section-heading">
        <div>
          <div class="visitor-eyebrow">SIGNATURE BLUEPRINTS</div>
          <h2 id="visitor-curated-title">Crafted Journeys for AWS Community Day</h2>
        </div>
        <a href="#/planner" class="visitor-text-link">Build Custom Route <span aria-hidden="true">→</span></a>
      </div>
      <div class="trips-container" id="home-curated-trips-mount"></div>
      <p class="visitor-route-footnote">Every blueprint adapts to your personal departure time and transportation mode.</p>
    </section>

    <!-- 5. GROUP TRAVEL GUIDANCE (FOR N PEOPLE) · SENIOR TRAVEL PLANNER ADVISORY -->
    <section class="group-travel-guidance-section" aria-labelledby="group-travel-title">
      <div class="visitor-section-heading">
        <div>
          <div class="visitor-eyebrow">SENIOR TRAVEL AGENT ADVISORY</div>
          <h2 id="group-travel-title">Traveling in a Group (N People)? Here's What Works</h2>
        </div>
        <p>Planning for friends, college gangs, or family? Mountain driving dynamics and parking differ greatly by vehicle size.</p>
      </div>

      <div class="group-guidance-grid">
        <div class="guidance-card">
          <div class="guidance-icon">🛵</div>
          <div class="guidance-body">
            <h3>1–2 People · Scooty / Two-Wheeler</h3>
            <p>Nimble and fast through Landour's tight hairpin turns. Easy parking at Char Dukan and Sisters' Bazaar. Rent for ₹500–₹700/day. Bundle up warmly against the chilly morning ghat breeze.</p>
            <div class="guidance-tag">Budget: ~₹300/person</div>
          </div>
        </div>

        <div class="guidance-card">
          <div class="guidance-icon">🚗</div>
          <div class="guidance-body">
            <h3>3–4 People · Sedan / Hatchback Cab</h3>
            <p>Ideal balance of comfort and hill agility. Maruti Dzire or Etios easily ascends up to Mussoorie and Picture Palace. Reserve with fixed return time. Split fare comes to ~₹600–₹800/person.</p>
            <div class="guidance-tag">Budget: ~₹650/person</div>
          </div>
        </div>

        <div class="guidance-card">
          <div class="guidance-icon">🚙</div>
          <div class="guidance-body">
            <h3>5–7 People · Innova Crysta / Ertiga SUV</h3>
            <p>Best for family or student teams with luggage. Powerful torque on steep slopes between Kuthalgate and Landour. Roomy seating, smooth mountain suspension, and secure boot space.</p>
            <div class="guidance-tag">Budget: ~₹600/person</div>
          </div>
        </div>

        <div class="guidance-card">
          <div class="guidance-icon">🚐</div>
          <div class="guidance-body">
            <h3>8+ People · Tempo Traveller (12–16 Seater)</h3>
            <p>Best for full hackathon batches. Note: Large vehicles cannot navigate upper Landour one-way loop. Park at Kingcraig or Picture Palace and take local shared shuttle taxis for the last 3 km.</p>
            <div class="guidance-tag">Budget: ~₹550/person</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. PRACTICAL VISITOR GUIDES (VISIT ABU DHABI ARTICLE HUB ESSENTIALS) -->
    <section class="visitor-guides-section" aria-labelledby="visitor-guides-title" style="margin-bottom:76px">
      <div class="visitor-section-heading">
        <div>
          <div class="visitor-eyebrow">PRACTICAL VISITOR GUIDES</div>
          <h2 id="visitor-guides-title">Essential Advice for Roaming the Hills</h2>
        </div>
        <p>Everything you need to know about hill traffic, sacred dress etiquette, sunset timing, and river safety.</p>
      </div>

      <div class="practical-guides-grid">
        <!-- Guide 1: Traffic -->
        <article class="practical-guide-card" data-guide-key="traffic">
          <div class="practical-guide-top">
            <span class="guide-tag">Hill Transit</span>
            <span class="guide-read-time mono">3 min read</span>
          </div>
          <h3 class="guide-title">Mussoorie Ghat Traffic & Landour Toll Rules</h3>
          <p class="guide-desc">The road climbs 1,400m across 30+ hairpin curves. Learn when to ascend before the weekend rush and navigate Landour's tight one-way loop.</p>
          <div class="guide-footer">
            <span class="guide-tip-chip">💡 Leave by 7:30 AM</span>
            <button type="button" class="guide-read-btn">Read Full Guide ↗</button>
          </div>
        </article>

        <!-- Guide 2: Monastery Etiquette -->
        <article class="practical-guide-card" data-guide-key="monastery">
          <div class="practical-guide-top">
            <span class="guide-tag" style="color:#AD5CFF;border-color:rgba(173,92,255,0.3)">Culture & Faith</span>
            <span class="guide-read-time mono">2 min read</span>
          </div>
          <h3 class="guide-title">Mindrolling Monastery & Great Stupa Etiquette</h3>
          <p class="guide-desc">Just 5 minutes from Graphic Era. Walking clockwise around the 60m Stupa, respectful attire, and silent photography protocols.</p>
          <div class="guide-footer">
            <span class="guide-tip-chip">🕊️ Clockwise Kora</span>
            <button type="button" class="guide-read-btn">Read Full Guide ↗</button>
          </div>
        </article>

        <!-- Guide 3: Winterline -->
        <article class="practical-guide-card" data-guide-key="winterline">
          <div class="practical-guide-top">
            <span class="guide-tag" style="color:#FF9900;border-color:rgba(255,153,0,0.3)">Optical Wonder</span>
            <span class="guide-read-time mono">3 min read</span>
          </div>
          <h3 class="guide-title">The Himalayan Winterline: Best Sunset Spots</h3>
          <p class="guide-desc">Visible only in Mussoorie and Switzerland. Why this atmospheric phenomenon appears between October and February, and where to catch it.</p>
          <div class="guide-footer">
            <span class="guide-tip-chip">🌅 Best at 5:15 PM</span>
            <button type="button" class="guide-read-btn">Read Full Guide ↗</button>
          </div>
        </article>

        <!-- Guide 4: Caves & Streams -->
        <article class="practical-guide-card" data-guide-key="caves">
          <div class="practical-guide-top">
            <span class="guide-tag" style="color:#00D492;border-color:rgba(0,212,146,0.3)">Nature & Safety</span>
            <span class="guide-read-time mono">2 min read</span>
          </div>
          <h3 class="guide-title">Robber's Cave: Footwear & Stream Safety</h3>
          <p class="guide-desc">Walking inside the natural limestone gorge involves wading in knee-deep water. Where to rent slippers and how to safeguard phones.</p>
          <div class="guide-footer">
            <span class="guide-tip-chip">👟 Rent Slippers ₹20</span>
            <button type="button" class="guide-read-btn">Read Full Guide ↗</button>
          </div>
        </article>
      </div>
    </section>

    <!-- 7. EXECUTIVE HILL TRAVEL & SAFETY DISPATCH -->
    <aside class="visitor-practical-note" style="background:linear-gradient(135deg,rgba(18,18,24,0.95) 0%,rgba(26,18,36,0.92) 100%);border:1px solid rgba(173,92,255,0.3);padding:24px 30px;border-radius:24px;box-shadow:0 12px 36px rgba(0,0,0,0.35);margin:48px 0 0">
      <div style="display:flex;align-items:center;gap:14px;flex:1;min-width:280px">
        <span style="font-size:32px;filter:drop-shadow(0 0 10px rgba(255,153,0,0.6))">🛡️</span>
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span class="mono" style="font-size:10.5px;font-weight:900;letter-spacing:0.08em;color:#00D492;text-transform:uppercase">HIMALAYAN EXPEDITION DISPATCH</span>
            <span style="font-size:11px;color:var(--mu)">· Field Safety Protocol</span>
          </div>
          <b style="font-size:16px;color:#F5F5F7;display:block;margin-bottom:4px">Before You Ascend from Graphic Era (Clement Town)</b>
          <p style="font-size:13px;color:#94A3B8;line-height:1.55;margin:0">
            Shivalik mountain weather and Rajpur Road ghat traffic evolve rapidly on weekends. Always maintain a 45-minute return daylight buffer, download offline Google Maps waypoints, and descend the Mussoorie ridge before 5:30 PM (Winterline dusk).
          </p>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <a href="#/planner" class="scd-btn-3d-primary" style="padding:10px 18px;font-size:13px;text-decoration:none">
          Launch Trip Planner ↗
        </a>
      </div>
    </aside>
  `;
}

export function initCinematicInteractions(
  rootEl: HTMLElement,
  onSelectRoute?: (routeId: string) => void,
  onCategoryChange?: (category: string) => void,
  onSearchChange?: (query: string) => void,
  onOpenGuide?: (guideKey: string) => void,
  onQuickMatch?: (params: { window: string; partySize: number; transport: string }) => void
) {
  // Horizontal wheel scroll helper for desktop trackpad/mouse
  const enableHScroll = (container: HTMLElement | null) => {
    if (!container) return;
    container.addEventListener('wheel', (e: WheelEvent) => {
      if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        container.scrollLeft += e.deltaY * 1.05;
        e.preventDefault();
      }
    }, { passive: false });
  };
  enableHScroll(rootEl.querySelector('.editorial-category-rail'));
  enableHScroll(rootEl.querySelector('.visitor-search-pills'));

  // 1. Category Filter Rail clicks
  const catPills = rootEl.querySelectorAll<HTMLButtonElement>('.editorial-cat-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      const cat = pill.dataset.homeCat || 'all';
      if (onCategoryChange) {
        onCategoryChange(cat);
      }
    });
  });

  // 2. Search Input handling
  const searchInput = rootEl.querySelector<HTMLInputElement>('#home-search-input');
  const clearBtn = rootEl.querySelector<HTMLButtonElement>('#home-search-clear');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim();
      if (clearBtn) {
        clearBtn.style.display = q.length > 0 ? 'inline-block' : 'none';
      }
      if (onSearchChange) {
        onSearchChange(q);
      }
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      if (onSearchChange) {
        onSearchChange('');
      }
      searchInput.focus();
    });
  }

  // 3. Quick Jump Pills
  const jumpPills = rootEl.querySelectorAll<HTMLButtonElement>('.home-jump-pill');
  jumpPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const jumpId = pill.dataset.jump;
      if (jumpId && searchInput) {
        searchInput.value = pill.textContent || '';
        if (clearBtn) clearBtn.style.display = 'inline-block';
        if (onSearchChange) {
          onSearchChange(pill.textContent || '');
        }
      }
    });
  });

  // 4. Practical Guides clicks
  const guideCards = rootEl.querySelectorAll<HTMLElement>('.practical-guide-card');
  guideCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.guideKey;
      if (key && onOpenGuide) {
        onOpenGuide(key);
      }
    });
  });

  // 5. MakeMyTrip Fast Travel Matcher CTA
  const matchBtn = rootEl.querySelector<HTMLButtonElement>('#btn-home-match-route');
  if (matchBtn) {
    matchBtn.addEventListener('click', () => {
      const windowSel = rootEl.querySelector<HTMLSelectElement>('#home-window-select')?.value || '8h';
      const partySel = parseInt(rootEl.querySelector<HTMLSelectElement>('#home-party-select')?.value || '4', 10);
      const transportSel = rootEl.querySelector<HTMLSelectElement>('#home-transport-select')?.value || 'car';
      if (onQuickMatch) {
        onQuickMatch({ window: windowSel, partySize: partySel, transport: transportSel });
      }
    });
  }
}
