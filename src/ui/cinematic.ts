/**
 * VISITOR-FIRST EDITORIAL LANDING PAGE (VISIT ABU DHABI ARTICLE-HUB STYLE)
 * AWS Student Community Day 2026 · Explore Doon × Mussoorie
 * Retains dark luxury palette: Deep space #0A0A0C, SCD violet #AD5CFF, AWS orange #FF9900, emerald #00D492
 */
import { resolveImg } from './app.ts';

export function renderCinematicLanding(): string {
  return `
    <!-- 1. EDITORIAL HERO WITH INTEGRATED SEARCH & JUMP BAR -->
    <section class="visitor-hero" aria-labelledby="visitor-title">
      <img class="visitor-hero-image" src="${resolveImg('lal-tibba.webp')}" alt="Himalayan snow range seen from Lal Tibba in Landour" fetchpriority="high">
      <div class="visitor-hero-shade"></div>
      
      <div class="visitor-hero-copy">
        <div class="visitor-kicker">
          <span class="live-dot"></span>
          <span>OFFICIAL VISITOR PORTAL · EXPLORE DOON × MUSSOORIE</span>
        </div>
        
        <h1 id="visitor-title">Stories from the Foothills.<br><span>Curated Trails & Roaming Studio.</span></h1>
        
        <p>
          From the pine-scented colonial ridges of Landour to the silent cloistered halls of Mindrolling and the icy river gorges of Gucchupani. Choose a story, explore the visual article hub, or generate your custom round-trip route from Graphic Era.
        </p>

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
            <button type="button" class="home-jump-pill" data-jump="bakehouse">Landour Bakehouse</button>
          </div>
        </div>

        <div class="visitor-hero-actions">
          <a href="#/planner" class="scd-btn-3d-primary">Open Route Planner 2.0 <span aria-hidden="true">↗</span></a>
          <a href="#/directory" class="visitor-hero-link">Browse All 30+ Destinations <span aria-hidden="true">→</span></a>
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
          <span class="visitor-route-detail">Quiet walk · Mindrolling Monastery & Tibetan Stupa right by campus</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="visitor-route-card" data-fast-track="4" type="button">
          <span class="visitor-route-index">02 <span>· HALF DAY (4H)</span></span>
          <span class="visitor-route-title">Valley Nature & Streams</span>
          <span class="visitor-route-detail">Wade inside Robber's Cave gorge or explore Sahastradhara springs</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="visitor-route-card" data-fast-track="8" type="button">
          <span class="visitor-route-index">03 <span>· FULL DAY (8H)</span></span>
          <span class="visitor-route-title">The Mussoorie & Landour Ridge</span>
          <span class="visitor-route-detail">Lal Tibba, Char Dukan pancakes, Mall Road & safe descent before dusk</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
      <p class="visitor-route-footnote">
        Hill roads have heavy weekend traffic. Explore Doon builds in a mandatory 45-minute return buffer to keep your journey stress-free.
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

    <!-- 5. PRACTICAL VISITOR GUIDES (VISIT ABU DHABI ARTICLE HUB ESSENTIALS) -->
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

    <!-- 6. PRACTICAL FOOTNOTE -->
    <aside class="visitor-practical-note">
      <span class="visitor-practical-icon" aria-hidden="true">✳</span>
      <div>
        <b>Before You Set Out from Graphic Era</b>
        <p>Himalayan hill weather and ghat road congestion can change quickly. Always ensure a 45-minute return daylight buffer, keep phones charged, and save your route in Google Maps for offline GPS.</p>
      </div>
      <a href="#/planner" aria-label="Open route planner">↗</a>
    </aside>
  `;
}

export function initCinematicInteractions(
  rootEl: HTMLElement,
  onSelectRoute?: (routeId: string) => void,
  onCategoryChange?: (category: string) => void,
  onSearchChange?: (query: string) => void,
  onOpenGuide?: (guideKey: string) => void
) {
  // 1. Category Filter Rail clicks
  const catPills = rootEl.querySelectorAll<HTMLButtonElement>('.editorial-cat-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
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
}
