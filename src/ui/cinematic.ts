/** Visitor-first landing page and small interactions for the Explore Doon guide. */
import { resolveImg } from './app.ts';

export function renderCinematicLanding(): string {
  return `
    <section class="visitor-hero" aria-labelledby="visitor-title">
      <img class="visitor-hero-image" src="${resolveImg('lal-tibba.webp')}" alt="Himalayan range seen from Lal Tibba in Landour" fetchpriority="high">
      <div class="visitor-hero-shade"></div>
      <div class="visitor-hero-copy">
        <div class="visitor-kicker"><span class="live-dot"></span> PLACES AROUND DEHRADUN & MUSSOORIE</div>
        <h1 id="visitor-title">A good day out<br><span>starts here.</span></h1>
        <p>Waterfall walks, old hill roads and quieter valley corners. Find a place that fits your day, then build a route from Graphic Era.</p>
        <div class="visitor-hero-actions">
          <a href="#/planner" class="scd-btn-3d-primary">Build my itinerary <span aria-hidden="true">↗</span></a>
          <a href="#/directory" class="visitor-hero-link">Explore all places <span aria-hidden="true">→</span></a>
        </div>
        <div class="visitor-hero-note"><span>Start nearby</span><b>Graphic Era · Clement Town</b><span class="visitor-note-divider"></span><span>Valley · hills · day trips</span></div>
      </div>
      <div class="visitor-image-caption"><span>01 / 03</span><span>Landour · Mussoorie ridge</span></div>
    </section>

    <section class="visitor-start-section" aria-labelledby="visitor-start-title">
      <div class="visitor-section-heading">
        <div><div class="visitor-eyebrow">START WITH THE TIME YOU HAVE</div><h2 id="visitor-start-title">Choose your kind of day.</h2></div>
        <p>Each option opens a real route in the planner. Change the start, return time, or travel style whenever you need.</p>
      </div>
      <div class="visitor-route-grid">
        <button class="visitor-route-card" data-fast-track="2" type="button">
          <span class="visitor-route-index">01 <span>· 2 HOURS</span></span>
          <span class="visitor-route-title">A little Doon</span>
          <span class="visitor-route-detail">Easy walk · A visit to Mindrolling Monastery</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="visitor-route-card" data-fast-track="4" type="button">
          <span class="visitor-route-index">02 <span>· HALF DAY</span></span>
          <span class="visitor-route-title">Valley nature</span>
          <span class="visitor-route-detail">Choose a river cave or a green valley stop</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="visitor-route-card" data-fast-track="8" type="button">
          <span class="visitor-route-index">03 <span>· FULL DAY</span></span>
          <span class="visitor-route-title">A full hill day</span>
          <span class="visitor-route-detail">Mussoorie or Landour, with time for the drive back</span>
          <span class="visitor-route-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
      <p class="visitor-route-footnote">Hill travel can slow down on busy days. The planner builds in a return buffer; check road and weather conditions before leaving.</p>
    </section>

    <section class="visitor-explore-section" aria-labelledby="visitor-explore-title">
      <div class="visitor-section-heading">
        <div><div class="visitor-eyebrow">A FEW PLACES TO BEGIN</div><h2 id="visitor-explore-title">Where do you want to go?</h2></div>
        <p>Each place has its own photo, visit notes and directions. Choose one to see the practical details.</p>
      </div>
      <div class="visitor-destination-grid" id="home-destination-grid"></div>
      <a href="#/directory" class="visitor-text-link visitor-all-places-link">Browse all places and food <span aria-hidden="true">→</span></a>
    </section>

    <section class="visitor-curated-section" aria-labelledby="visitor-curated-title">
      <div class="visitor-section-heading"><div><div class="visitor-eyebrow">LOCAL ROUTE IDEAS</div><h2 id="visitor-curated-title">A few good ways to spend a day.</h2></div><a href="#/planner" class="visitor-text-link">Build my own route <span aria-hidden="true">→</span></a></div>
      <div class="trips-container" id="home-curated-trips-mount"></div>
      <p class="visitor-route-footnote">Each route adapts to your available time and return deadline. You can swap stops in the planner.</p>
    </section>

    <aside class="visitor-practical-note"><span class="visitor-practical-icon" aria-hidden="true">✳</span><div><b>Before you set out</b><p>Hill traffic and weather can change quickly. Keep a daylight return buffer, confirm current opening hours, and save your route for the day.</p></div><a href="#/planner" aria-label="Open route planner">↗</a></aside>
  `;
}

export function initCinematicInteractions(_rootEl: HTMLElement, _onSelectRoute?: (routeId: string) => void) {
  // Route cards use the shared data-fast-track handler in ExploreDoonApp.
}
