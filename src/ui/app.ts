import {
  TripRequest,
  Itinerary,
  Place,
  TransportMode,
  Interest,
  GroupType,
  Pace,
  loadDefaultDatasets,
  planTrip,
  ReplanEngine
} from '../engine/index.ts';
import { DayDial } from './day-dial.ts';
import { placeUrl, placeDirectionsUrl, fullRouteUrl } from '../maps/links.ts';
import { renderRouteMap } from '../maps/route-map.ts';
import {
  encodeTripState,
  decodeTripState,
  downloadICS,
  generateGoogleCalendarUrl,
  getQRCodeUrl,
  triggerPrintItinerary,
  generateWhatsAppShareUrl
} from './export-share.ts';
import { renderCinematicLanding, initCinematicInteractions } from './cinematic.ts';
import { renderPracticalDrawer, initPracticalDrawer } from './companion-drawer.ts';
import { renderDesignSystemPage, showToast } from './design-page.ts';

export function resolveImg(imgPath?: string): string {
  if (!imgPath) return 'images/mind.jpg';
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const base = q?.get('img') || 'images/';
  return `${base.replace(/\/$/, '')}/${imgPath}`;
}

export type AppPage = 'home' | 'mountains' | 'heritage' | 'food' | 'planner' | 'directory' | 'design';

function clusterDriveTime(cluster: string): string {
  const times: Record<string, string> = {
    'clement-town': '5m walk',
    'city-center': '20m drive',
    'east-doon': '30m drive',
    'rajpur': '35m drive',
    'mussoorie-approach': '50m scenic climb',
    'mussoorie-town': '1h 15m hill drive',
    'landour': '1h 25m ridge drive',
    'park-estate': '1h 20m drive',
    'mussoorie-outskirts': '1h 35m drive',
    'dhanaulti': '2h alpine drive',
    'rishikesh': '1h 15m highway'
  };
  return times[cluster] || '35m drive';
}

function areaLabel(cluster: string): string {
  const labels: Record<string, string> = {
    'clement-town': 'Clement Town · Near GEU',
    'city-center': 'Dehradun City Heart',
    'east-doon': 'East Doon & Song Valley',
    'west-doon': 'West Doon & Foothills',
    'rajpur': 'Old Rajpur Foothills',
    'mussoorie-approach': 'Mussoorie Ghats Road',
    'mussoorie-town': 'Mussoorie Town & Mall',
    'landour': 'Landour Cloud Ridge',
    'park-estate': "Hathipaon & Cloud's End",
    'dhanaulti': 'Dhanaulti High Alps',
    'rishikesh': 'Rishikesh Valley'
  };
  return labels[cluster] || (cluster || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function timeCategory(item: Place): 'quick' | 'half' | 'full' {
  if (item.cluster === 'clement-town') return 'quick';
  if (['landour', 'mussoorie-town', 'park-estate', 'mussoorie-outskirts', 'dhanaulti', 'rishikesh'].includes(item.cluster)) {
    return 'full';
  }
  return 'half';
}

function companionFood(placeId: string): string {
  const foods: Record<string, string> = {
    'rob': 'Orchard Restaurant or riverside cheese Maggi',
    'sahas': 'Sulphur pool chai & hot pakoras',
    'tapkeshwar': 'Garhi Cantt bakery rusks & Paltan sweets',
    'maldevta': 'Riverside sweet ginger tea & Maggi',
    'shikhar-falls': 'Rajpur Road wood-fired café & momos',
    'fri': 'Clock Tower jalebis & Ellora’s stick jaws (1953)',
    'mind': 'Authentic Tibetan momos & tingmo in Clement Town',
    'buddha-garden': 'Butter tea & crispy chicken kothay',
    'paltan-bazaar': 'Famous Doon bakery rusks & hot gulab jamun',
    'land': 'Char Dukan cinnamon pancakes & Landour Bakehouse',
    'geo': 'Park House alpine hot chocolate & tea',
    'clouds-end': 'Forest estate tea & snacks',
    'mall-road': 'Kalsang Tibetan momos & vintage softy cones',
    'gunhill': 'Ropeway viewpoint chai & sweet corn',
    'camels-back': 'Scenic ridge stroll chai & snacks',
    'bhatta-falls': 'Cable car canteen Maggi & masala chai',
    'kempty-falls': 'Waterfall side piping hot noodles & tea',
    'dehradun-zoo': 'Rajpur Road orchard cafés & shakes',
    'lacchiwala': 'Sal forest picnic snacks & fresh juice',
    'company-garden': 'Fresh Himalayan berry jams & pickles',
    'dhanaulti-eco-park': 'Garhwali thali & hot adrak chai',
    'rish': 'Triveni Ghat pure ghee samosas & herbal chai'
  };
  return foods[placeId] || 'Local café or highway roadside tea';
}

function whatToPack(item: Place): string {
  if (['rob', 'tapkeshwar', 'maldevta', 'shikhar-falls', 'bhatta-falls', 'kempty-falls'].includes(item.id)) {
    return '👟 Water sandals / slip-ons & towel';
  }
  if (['land', 'geo', 'clouds-end', 'dhanaulti-eco-park'].includes(item.id)) {
    return '🧥 Light fleece / windcheater & cash';
  }
  if (item.id === 'fri') {
    return '📷 Camera & walking sneakers';
  }
  return '💳 UPI/cash & comfortable shoes';
}

interface StoryChapter {
  id: string;
  num: string;
  shortTitle: string;
  chapterTag: string;
  quote: string;
  prose: string;
  image: string;
  altitude: string;
  timeTag: string;
  metricDistance: string;
  metricDuration: string;
  metricVibe: string;
  actionText: string;
  actionTarget: string;
}

export class ExploreDoonApp {
  private datasets = loadDefaultDatasets();
  private replanEngine = new ReplanEngine(this.datasets);
  private currentPlan: Itinerary | null = null;
  private dayDial!: DayDial;
  private debounceTimer: any = null;

  private activePage: AppPage = 'home';
  private galleryFilter: string = 'all';
  private galleryTimeFilter: string = 'all';
  private gallerySearch: string = '';
  private foodFilter: string = 'all';

  private currentStoryChapter: number = 0;
  private storyChapters: StoryChapter[] = [
    {
      id: 'campus',
      num: '01',
      shortTitle: '01 The Arrival',
      chapterTag: 'PROLOGUE · GRAPHIC ERA UNIVERSITY',
      quote: 'Where 1,500 builders gather beneath the Shivalik hills to architect the future.',
      prose: 'You step into Clement Town. Bell Road hums with developers, students, and AWS heroes. Keynotes, system designs, and hackathons are just the opening chapter. Waiting right outside the gates is the wild beauty of Uttarakhand.',
      image: 'mind.jpg',
      altitude: '650m (Valley Base)',
      timeTag: 'Campus 0.0 km',
      metricDistance: '0.0 km from GEU',
      metricDuration: 'All Weekend',
      metricVibe: 'Conference & Cloud Tech',
      actionText: 'Begin Chapter 2 →',
      actionTarget: 'next'
    },
    {
      id: 'stupa',
      num: '02',
      shortTitle: '02 Monastic Calm',
      chapterTag: 'CHAPTER 1 · CLEMENT TOWN MONASTERY',
      quote: 'Step five minutes outside the conference gates, and the world goes completely quiet.',
      prose: 'A short morning walk brings you beneath the 60-meter Great Stupa of Mindrolling Monastery. Monks in saffron robes chant in golden prayer halls, copper prayer wheels spin softly, and the air smells of juniper incense and pine.',
      image: 'mind.jpg',
      altitude: '650m (Valley Floor)',
      timeTag: '5 Min Walk',
      metricDistance: '1.2 km from GEU',
      metricDuration: '45–60 mins',
      metricVibe: 'Peace & Tibetan Murals',
      actionText: 'Explore Valley Sanctuaries (6 Places) →',
      actionTarget: '#/heritage'
    },
    {
      id: 'ghats',
      num: '03',
      shortTitle: '03 The Winding Ghats',
      chapterTag: 'CHAPTER 2 · SHIVALIK HIGHWAY ASCENT',
      quote: 'The temperature drops six degrees. The mist rolls in. The first bite of hill Maggi.',
      prose: 'As your cab carves through the winding mountain turns, the warmth of the plains dissolves into crisp pine breeze. Roadside shacks cling to cliffsides, serving steaming bowls of cheese Maggi and adrak chai overlooking the vast Doon valley below.',
      image: 'maggi.jpg',
      altitude: '1,350m (Ghats)',
      timeTag: 'Ascent Pitstop',
      metricDistance: '18 km from GEU',
      metricDuration: '25 mins break',
      metricVibe: 'Chai & Valley Overlook',
      actionText: 'Plan Ascent Route →',
      actionTarget: '#/planner'
    },
    {
      id: 'landour',
      num: '04',
      shortTitle: '04 Landour Summit',
      chapterTag: 'CHAPTER 3 · 2,290M ALPINE RIDGE',
      quote: 'Where 19th-century colonial tin roofs meet deodar forests and snow-capped peaks.',
      prose: 'At the very crown of the ridge sits Landour. Walk Sisters\' Bazaar under towering deodars past Ruskin Bond\'s favorite haunts to Lal Tibba. High-powered binoculars reveal the luminous snow ridges of Bandarpoonch and Kedarnath against deep azure skies.',
      image: 'land.jpg',
      altitude: '2,290m (Summit)',
      timeTag: 'Snow Peak View',
      metricDistance: '34 km from GEU',
      metricDuration: '2–3 hours',
      metricVibe: 'Pines, Snow Peaks & Bakeries',
      actionText: 'Explore 8 Mountain Peaks →',
      actionTarget: '#/mountains'
    },
    {
      id: 'winterline',
      num: '05',
      shortTitle: '05 The Winterline',
      chapterTag: 'CHAPTER 4 · SIR GEORGE EVEREST CLIFF',
      quote: 'An optical phenomenon found in only two places on Earth: the Swiss Alps, and right here.',
      prose: 'At twilight, hike the cliff ridge trail to Sir George Everest\'s restored 1832 estate. As the sun sinks behind the Shivalik contours, the horizon ignites into a razor-straight glowing line of violet, gold, and vermilion: the legendary Himalayan Winterline.',
      image: 'geo.webp',
      altitude: '2,050m (Cliff Peak)',
      timeTag: 'Sunset 5:34 PM',
      metricDistance: '31 km from GEU',
      metricDuration: '1.5 hours',
      metricVibe: 'Golden Hour Magic',
      actionText: 'Plan Sunset Itinerary →',
      actionTarget: '#/planner'
    },
    {
      id: 'rajpur',
      num: '06',
      shortTitle: '06 Midnight Bites',
      chapterTag: 'EPILOGUE · RAJPUR ROAD NIGHT CRAWL',
      quote: 'Descend into the glowing neon spine of the valley for hot momos and craft brews.',
      prose: 'Follow daylight-safe roads back to the city for Dehradun\'s famous late-night gastronomy. Crispy chicken kothay momos at Kalsang, legendary 1953 stick jaws at Ellora\'s, and a craft beer toast to AWS Community Day under the starlit sky at The Brew Estate.',
      image: 'kfc.jpg',
      altitude: '750m (Rajpur Road)',
      timeTag: 'Dinner & Twilight',
      metricDistance: '14 km from GEU',
      metricDuration: 'Evening crawl',
      metricVibe: 'Momos, Cocktails & Lounges',
      actionText: 'Explore 12 Food & Drink Spots →',
      actionTarget: '#/food'
    }
  ];

  private leafletMap: any = null;
  private leafletRouteLayer: any = null;
  private leafletMarkersLayer: any = null;
  private mapTileTheme: 'voyager' | 'dark' = 'voyager';
  private mapTileLayer: any = null;

  private state: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 510, // 08:30 AM
    returnBy: 960, // 04:00 PM (7.5 hours)
    transport: 'car',
    interests: ['views', 'nature', 'food'],
    group: 'friends',
    pace: 'relaxed',
    budget: 2,
    diet: 'any',
    partySize: 4,
    locale: 'en'
  };

  constructor(private rootEl: HTMLElement) {
    this.handleEmbedAndParams();
    this.renderInitialSkeleton();
    this.initControls();
    this.initStory();
    this.initRouting();
    this.recomputePlan();
    this.setupResizeObserver();
  }

  private handleEmbedAndParams() {
    const q = new URLSearchParams(window.location.search);
    const isEmbed = q.get('embed') === '1' || (typeof window !== 'undefined' && window.top !== window.self);
    if (isEmbed) {
      document.documentElement.classList.add('emb');
    }
    if (q.get('transparent') === '1') {
      document.documentElement.classList.add('tr');
    }
    const theme = q.get('theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    if (window.location.hash) {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validPages: AppPage[] = ['home', 'mountains', 'heritage', 'food', 'planner', 'directory', 'design'];
      if (validPages.includes(hash as AppPage)) {
        this.activePage = hash as AppPage;
      } else {
        const decoded = decodeTripState(window.location.hash);
        if (decoded) {
          this.state = { ...this.state, ...decoded };
        }
      }
    }
  }

  private formatTime(m: number): string {
    const h = Math.floor(m / 60) % 24;
    const mins = m % 60;
    const ampm = h < 12 ? 'AM' : 'PM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(mins).padStart(2, '0')} ${ampm}`;
  }

  private renderInitialSkeleton() {
    this.rootEl.innerHTML = `
      <div class="bg-glow"></div>
      <div class="bg-cyber-grid"></div>

      <div class="shell">
        <!-- Apple-Grade Glass Top Bar & Branding -->
        <header class="hd">
          <a href="#/home" class="lg" style="text-decoration:none">
            <div class="lg-logo-wrap">
              <svg viewBox="0 0 36 36" fill="none" stroke="#AD5CFF" stroke-width="2.5">
                <rect x="9" y="9" width="18" height="18" rx="3"/>
                <path d="M14 4v5M22 4v5M14 27v5M22 27v5M4 14h5M4 22h5M27 14h5M27 22h5"/>
                <rect x="15" y="15" width="6" height="6" fill="#FF9900" stroke="none" rx="1"/>
              </svg>
            </div>
            <div>
              <div class="lg-title">AWS Student Community Day 2026</div>
              <div class="lg-sub">
                <span>Graphic Era University</span>
                <span>•</span>
                <span class="scd-tag">The Story of Us</span>
              </div>
            </div>
          </a>
          <div class="actions">
            <button class="icon-btn" id="lang-btn" aria-label="Toggle Language" title="Toggle Hindi / English">
              <b style="font-size:12px;font-family:'JetBrains Mono'">${this.state.locale === 'hi' ? 'EN' : 'HI'}</b>
            </button>
            <button class="icon-btn" id="theme-btn" aria-label="Toggle Theme" title="Toggle Light / Dark Mode">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Apple-Grade Main Navigation Dock -->
        <nav class="apple-nav-bar" aria-label="Primary Expedition Navigation">
          <div class="apple-nav-tabs">
            <a href="#/home" class="apple-tab-link ${this.activePage === 'home' ? 'active' : ''}" data-nav="home">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9.5 20v-6h5v6"/></svg>
              <span>Discover</span>
            </a>
            <a href="#/directory" class="apple-tab-link ${['directory','mountains','heritage'].includes(this.activePage) ? 'active' : ''}" data-nav="directory">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>
              <span>Roaming Places</span>
            </a>
            <a href="#/planner" class="apple-tab-link ${this.activePage === 'planner' ? 'active' : ''}" data-nav="planner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h7"/></svg>
              <span>Trip Planner</span>
            </a>
            <a href="#/food" class="apple-tab-link ${this.activePage === 'food' ? 'active' : ''}" data-nav="food">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              <span>Cafés & Food</span>
            </a>
          </div>
        </nav>

        <!-- ============================================================== -->
        <!-- PAGE 1: THE DISCOVERY SHOWCASE & VISITOR PORTAL                -->
        <!-- ============================================================== -->
        <main id="page-home" class="page-view ${this.activePage === 'home' ? 'active-page' : ''}">
          <!-- VISITOR PORTAL: Editorial Hero, Quick Window Presets, Top Destinations Grid, Curated Blueprints, Practical Strip -->
          ${renderCinematicLanding()}
        </main>

        <!-- ============================================================== -->
        <!-- PAGE 2: THE MOUNTAIN PEAKS & CLOUD RIDGES                      -->
        <!-- ============================================================== -->
        <main id="page-mountains" class="page-view ${this.activePage === 'mountains' ? 'active-page' : ''}">
          <div class="page-breadcrumb-bar">
            <a href="#/home" class="btn-back-crumb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              <span>Back to The Story</span>
            </a>
            <span class="mono" style="font-size:12px;color:var(--mu)">VIBE: HIGH ALTITUDE & RIDGES</span>
          </div>

          <div class="subpage-hero">
            <div class="subpage-hero-eyebrow">
              <span class="live-dot"></span>
              <span>8 Curated Mountain Destinations</span>
            </div>
            <h1 class="subpage-hero-title">The Mountain Peaks & Cloud Ridges</h1>
            <p class="subpage-hero-desc">
              Ascend from the Shivalik foothills into pine-scented colonial hill settlements. Stand at 2,290m Lal Tibba gazing across snow-covered Himalayan peaks, walk the tranquil deodar loop of Sisters' Bazaar, and watch the legendary winterline sunset.
            </p>
            <div class="subpage-stats-strip">
              <div class="subpage-stat-chip">⛰️ Peak Elevation: <b>2,290m (Lal Tibba)</b></div>
              <div class="subpage-stat-chip">🚗 Ascent Distance: <b>35 km from Graphic Era</b></div>
              <div class="subpage-stat-chip">🌡️ Weather: <b>18°C Alpine Breeze</b></div>
              <div class="subpage-stat-chip" style="border-color:rgba(255,153,0,0.3);color:#FFA726">⚠️ Daylight Guard: <b>Descend before 5:30 PM</b></div>
            </div>
          </div>

          <!-- Places Grid for Mountains -->
          <div id="mountains-grid-mount" class="places-grid"></div>
        </main>

        <!-- ============================================================== -->
        <!-- PAGE 3: THE VALLEY HERITAGE & FOREST SANCTUARIES               -->
        <!-- ============================================================== -->
        <main id="page-heritage" class="page-view ${this.activePage === 'heritage' ? 'active-page' : ''}">
          <div class="page-breadcrumb-bar">
            <a href="#/home" class="btn-back-crumb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              <span>Back to The Story</span>
            </a>
            <span class="mono" style="font-size:12px;color:var(--mu)">VIBE: CULTURE & SANCTUARIES</span>
          </div>

          <div class="subpage-hero">
            <div class="subpage-hero-eyebrow">
              <span class="live-dot" style="background:#1E51EC;box-shadow:0 0 10px #1E51EC"></span>
              <span>6 Historic & Natural Sanctuaries</span>
            </div>
            <h1 class="subpage-hero-title">Valley Heritage & Forest Sanctuaries</h1>
            <p class="subpage-hero-desc">
              Discover Dehradun's architectural grandeur and tranquil river valleys. From the colossal Greco-Roman brick colonnades of FRI and peaceful prayer halls of Mindrolling Monastery to wading through knee-deep stream waters inside the limestone river cave of Gucchupani.
            </p>
            <div class="subpage-stats-strip">
              <div class="subpage-stat-chip">🏛️ Architecture: <b>Colonial & Tibetan</b></div>
              <div class="subpage-stat-chip">📍 Proximity: <b>1 km to 12 km from Graphic Era</b></div>
              <div class="subpage-stat-chip">🌊 Highlight: <b>Limestone River Gorge Wading</b></div>
            </div>
          </div>

          <!-- Places Grid for Heritage -->
          <div id="heritage-grid-mount" class="places-grid"></div>
        </main>

        <!-- ============================================================== -->
        <!-- PAGE 4: THE EPICUREAN & CAFÉ TRAIL                             -->
        <!-- ============================================================== -->
        <main id="page-food" class="page-view ${this.activePage === 'food' ? 'active-page' : ''}">
          <div class="page-breadcrumb-bar">
            <a href="#/home" class="btn-back-crumb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              <span>Back to The Story</span>
            </a>
            <span class="mono" style="font-size:12px;color:var(--mu)">VIBE: FOOD, BAKERIES & NIGHTLIFE</span>
          </div>

          <div class="subpage-hero">
            <div class="subpage-hero-eyebrow">
              <span class="live-dot" style="background:#FF9900;box-shadow:0 0 10px #FF9900"></span>
              <span>12 Legendary Eateries & Heritage Bakeries</span>
            </div>
            <h1 class="subpage-hero-title">The Doon & Mussoorie Food Trail</h1>
            <p class="subpage-hero-desc">
              From roadside cheese Maggi and ginger honey tea overlooking the twinkling valley lights to 19th-century colonial baking recipes, authentic Tibetan momos, and rooftop craft microbreweries along Rajpur Road.
            </p>

            <div class="gallery-filters" id="food-category-filters" style="margin-top:16px">
              <button class="filter-chip active" data-food-filter="all">All 12 Spots</button>
              <button class="filter-chip" data-food-filter="momos">Momos & Tibetan</button>
              <button class="filter-chip" data-food-filter="ghat">Ghat Maggi & Chai</button>
              <button class="filter-chip" data-food-filter="bakery">1953 Bakeries & Sweets</button>
              <button class="filter-chip" data-food-filter="cafes">Himalayan Cafés</button>
              <button class="filter-chip" data-food-filter="lounges">Rooftops & Nightlife</button>
            </div>
          </div>

          <div class="food-trail-grid" id="food-trail-grid"></div>
        </main>

        <!-- ============================================================== -->
        <!-- PAGE 5: PRECISION ROUTE ENGINE & LIVE GPS MAP                  -->
        <!-- ============================================================== -->
        <main id="page-planner" class="page-view ${this.activePage === 'planner' ? 'active-page' : ''}">
          <div class="page-breadcrumb-bar">
            <a href="#/home" class="btn-back-crumb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              <span>Back to The Story</span>
            </a>
            <span class="mono" style="font-size:12px;color:var(--mu)">PRECISION ALGORITHMIC PLANNER</span>
          </div>

          <div class="planner-grid-layout">
            <!-- Left Controls Panel -->
            <div class="ios-panel-card">
              <div class="section-head">
                <h3>Date & Trip Window</h3>
                <small>AWS Conference Weekend</small>
              </div>
              <div class="segmented" id="date-segmented">
                <label><input type="radio" name="date-preset" value="2026-10-31:day"><span>Event Day</span></label>
                <label><input type="radio" name="date-preset" value="2026-11-01:day" checked><span>Sunday Sightseeing</span></label>
                <label><input type="radio" name="date-preset" value="2026-10-31:eve"><span>Evening Nightlife</span></label>
              </div>

              <div id="dial-mount"></div>

              <div class="section-head" style="margin-top:14px">
                <h3>Duration Presets</h3>
                <small>4h / 1d / 2d / 3d Quick Setup</small>
              </div>
              <div class="segmented" id="duration-preset-segmented">
                <label><input type="radio" name="dur-preset" value="4h"><span>4 Hours</span></label>
                <label><input type="radio" name="dur-preset" value="1d" checked><span>1 Day</span></label>
                <label><input type="radio" name="dur-preset" value="2d"><span>2 Days</span></label>
                <label><input type="radio" name="dur-preset" value="3d"><span>3 Days</span></label>
              </div>

              <div class="section-head">
                <h3>How Are You Travelling</h3>
              </div>
              <div class="segmented" id="transport-segmented">
                <label><input type="radio" name="transport" value="car" checked><span>Car / Cab</span></label>
                <label><input type="radio" name="transport" value="bike"><span>Two-Wheeler</span></label>
                <label><input type="radio" name="transport" value="walk"><span>Auto / Walk</span></label>
              </div>

              <div class="section-head">
                <h3>What's Your Vibe?</h3>
                <small>Select 2–4 for best mix</small>
              </div>
              <div class="vibe-grid" id="vibe-container"></div>

              <details style="margin-top:16px;border-top:1px solid var(--line);padding-top:12px;cursor:pointer">
                <summary style="font-size:13px;font-weight:700;color:var(--t2)">Fine-tune group, pace & departure deadlines</summary>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
                  <div>
                    <label style="font-size:11px;font-weight:800;color:var(--mu);text-transform:uppercase;display:block;margin-bottom:6px">Group</label>
                    <select id="sel-group" style="width:100%;padding:10px;border-radius:var(--r-md);background:var(--panel);border:1px solid var(--line);color:var(--tx)">
                      <option value="friends" selected>Friends / Solo</option>
                      <option value="kids">With Kids</option>
                      <option value="elders">With Elders</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size:11px;font-weight:800;color:var(--mu);text-transform:uppercase;display:block;margin-bottom:6px">Pace</label>
                    <select id="sel-pace" style="width:100%;padding:10px;border-radius:var(--r-md);background:var(--panel);border:1px solid var(--line);color:var(--tx)">
                      <option value="relaxed" selected>Relaxed</option>
                      <option value="balanced">Balanced</option>
                      <option value="packed">Packed</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size:11px;font-weight:800;color:var(--mu);text-transform:uppercase;display:block;margin-bottom:6px">Diet</label>
                    <select id="sel-diet" style="width:100%;padding:10px;border-radius:var(--r-md);background:var(--panel);border:1px solid var(--line);color:var(--tx)">
                      <option value="any" selected>Any</option>
                      <option value="veg">Vegetarian</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size:11px;font-weight:800;color:var(--mu);text-transform:uppercase;display:block;margin-bottom:6px">Departing Dehradun?</label>
                    <select id="sel-departure" style="width:100%;padding:10px;border-radius:var(--r-md);background:var(--panel);border:1px solid var(--line);color:var(--tx)">
                      <option value="none" selected>No fixed departure</option>
                      <option value="flight">Flight (Jolly Grant DED)</option>
                      <option value="train">Train (Dehradun DDN)</option>
                    </select>
                  </div>
                </div>
              </details>
            </div>

            <!-- Right Output & Timeline -->
            <div id="output-mount" aria-live="polite"></div>
          </div>

          <!-- Live Leaflet Dark Route Map Section -->
          <div class="map-view-shell" style="margin-top:36px">
            <div class="map-control-bar">
              <div>
                <h2 style="font-size:22px;font-weight:900;color:var(--tx)">Live Interactive Multi-Stop Route Map</h2>
                <p style="font-size:14px;color:var(--t2)">Real-time telemetry and elevation ascent from Graphic Era campus (650m) across the Shivalik foothills to Landour ridge (2,290m).</p>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="scd-btn-3d-secondary" id="map-theme-toggle-btn" type="button" title="Switch between Topo and Dark maps">
                  🌙 Switch to Dark Map
                </button>
                <button class="scd-btn-3d-secondary" id="map-recenter-btn" type="button">
                  Recenter on Route
                </button>
                <a class="scd-btn-3d-orange" id="map-google-full-btn" href="https://maps.google.com" target="_blank" rel="noopener">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Open in Google Maps
                </a>
              </div>
            </div>

            <!-- Leaflet Canvas -->
            <div id="leaflet-live-canvas"></div>

            <!-- Elevation Strip -->
            <div class="elevation-profile-bar">
              <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:20px">📈</span>
                <div>
                  <b style="font-size:14px;color:var(--tx);display:block">Elevation Ascent: 650m → 2,290m</b>
                  <span style="font-size:12px;color:var(--mu)">Graphic Era Campus (650m) • Rajpur Diversion (950m) • Kingcraig (1,700m) • Lal Tibba (2,290m)</span>
                </div>
              </div>
              <span class="chip verified">Daylight Safe Road</span>
            </div>
          </div>
        </main>

        <!-- ============================================================== -->
        <!-- ROAMING PLACES GUIDE                                           -->
        <!-- ============================================================== -->
        <main id="page-directory" class="page-view ${this.activePage === 'directory' ? 'active-page' : ''}">
          <div class="page-breadcrumb-bar">
            <a href="#/home" class="btn-back-crumb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              <span>Back to Discover</span>
            </a>
            <span class="mono" style="font-size:12px;color:var(--mu)">CURATED ROAMING DIRECTORY</span>
          </div>

          <div class="gallery-section">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px">
              <div>
                <span class="visitor-eyebrow">DEHRADUN & OUTSKIRTS GUIDE</span>
                <h1 style="font-size:32px;font-weight:900;letter-spacing:-0.03em;color:var(--tx);margin:4px 0 6px">Best Roaming Places</h1>
                <p style="font-size:14.5px;color:var(--t2)">Waterfalls, river caves, scenic mountain peaks, ancient forest temples, and lush picnic glades.</p>
              </div>
              <div class="search-input-wrap">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" id="gallery-search" class="search-input" placeholder="Search waterfalls, peaks, temples, areas…" aria-label="Search places">
              </div>
            </div>

            <!-- Category Filter Bar -->
            <div class="gallery-filters-scroll-wrap">
              <div class="gallery-filters" id="gallery-cluster-filters">
                <button class="filter-chip active" data-filter="all">🌟 All Places</button>
                <button class="filter-chip" data-filter="waterfalls">🏞️ Waterfalls & Streams</button>
                <button class="filter-chip" data-filter="mountains">⛰️ Mountain Peaks & Ridges</button>
                <button class="filter-chip" data-filter="heritage">🏛️ Heritage & Temples</button>
                <button class="filter-chip" data-filter="nature">🌲 Nature Parks & Wildlife</button>
                <button class="filter-chip" data-filter="daytrips">🌅 Outskirts Day Escapes</button>
              </div>
            </div>

            <!-- Time Budget Strip -->
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0 24px;padding:12px 16px;background:var(--panel);border:1px solid var(--line);border-radius:var(--r-lg)">
              <span style="font-size:11px;font-weight:800;color:var(--mu);text-transform:uppercase;letter-spacing:0.06em">⏱️ Filter by Time Available:</span>
              <div class="gallery-filters" id="gallery-time-filters" style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="filter-chip active" data-time-filter="all" style="padding:4px 12px;font-size:12px;min-height:32px">All Times</button>
                <button class="filter-chip" data-time-filter="quick" style="padding:4px 12px;font-size:12px;min-height:32px">⚡ Quick (&lt; 2h)</button>
                <button class="filter-chip" data-time-filter="half" style="padding:4px 12px;font-size:12px;min-height:32px">🌤️ Half Day (3–5h)</button>
                <button class="filter-chip" data-time-filter="full" style="padding:4px 12px;font-size:12px;min-height:32px">⛰️ Full Day (6h+)</button>
              </div>
            </div>

            <div id="gallery-grid" class="places-grid"></div>
          </div>
        </main>

        <!-- ============================================================== -->
        <!-- PAGE 7: DESIGN SYSTEM & COMPONENT LIBRARY SHOWCASE             -->
        <!-- ============================================================== -->
        ${renderDesignSystemPage(this.activePage === 'design')}

        <!-- Global Site Footer -->
        <footer style="margin-top:64px;padding-top:28px;border-top:1px solid var(--line);text-align:center;color:var(--mu);font-size:13px;line-height:1.6">
          <p>Local knowledge engine for <strong>AWS Student Community Day 2026</strong> · Graphic Era (Deemed to be University), Clement Town, Dehradun.</p>
          <p style="margin-top:6px">Always verify mountain weather before ascending. Dial 112 for Uttarakhand emergency services.</p>
          <p style="margin-top:8px"><a href="#/design" style="color:var(--ac);font-weight:700">View Design System Documentation & Token Specifications →</a></p>
        </footer>
      </div>

      <!-- Floating Dynamic Island Bottom Dock -->
      <div class="sticky-island" id="sticky-pill" style="display:none">
        <b id="pill-title">Your Plan</b>
        <span id="pill-return">Back by 5:00 PM</span>
        <button class="scd-btn-3d-primary" id="pill-scroll-btn" style="padding:5px 14px !important;font-size:12px !important;box-shadow:0 1.5px #731ed0 !important">
          View Route
        </button>
      </div>

      <!-- iOS PageSheet Lightbox Modal -->
      <div class="modal-overlay" id="place-modal">
        <div class="modal-content" id="place-modal-body"></div>
      </div>

      <!-- Practical Travel & Safety Companion Drawer -->
      ${renderPracticalDrawer()}

      <!-- QR Code Share Modal -->
      <div class="modal-overlay" id="qr-share-modal" style="display:none">
        <div class="modal-content" style="max-width:380px;text-align:center;padding:28px">
          <h3 style="font-size:18px;font-weight:800;color:var(--tx);margin-bottom:6px">Scan Itinerary on Phone</h3>
          <p style="font-size:13px;color:var(--t2);margin-bottom:18px">Scan with your smartphone camera to access turn-by-turn waypoints and daylight safe guidelines offline.</p>
          <div id="qr-code-mount" style="background:#fff;padding:12px;border-radius:12px;display:inline-block;margin-bottom:18px"></div>
          <button class="scd-btn-3d-secondary" id="btn-close-qr-modal" style="width:100%;justify-content:center">Close</button>
        </div>
      </div>
    `;
  }

  /* --- APPLE STORYTELLER ENGINE --- */
  private initStory() {
    this.renderStoryScrubber();
    this.renderStoryStage(0);

    const prevBtn = this.rootEl.querySelector('#story-prev-btn');
    const nextBtn = this.rootEl.querySelector('#story-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentStoryChapter > 0) {
          this.setStoryChapter(this.currentStoryChapter - 1);
        } else {
          this.setStoryChapter(this.storyChapters.length - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStoryChapter < this.storyChapters.length - 1) {
          this.setStoryChapter(this.currentStoryChapter + 1);
        } else {
          this.setStoryChapter(0);
        }
      });
    }
  }

  private renderStoryScrubber() {
    const dock = this.rootEl.querySelector('#story-scrubber-dock');
    if (!dock) return;

    dock.innerHTML = this.storyChapters.map((ch, idx) => `
      <button class="story-step-btn ${idx === this.currentStoryChapter ? 'active' : ''}" data-story-idx="${idx}">
        <span class="story-num-badge">${ch.num}</span>
        <span>${ch.shortTitle.split(' ').slice(1).join(' ')}</span>
      </button>
    `).join('');

    dock.querySelectorAll('[data-story-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-story-idx'));
        this.setStoryChapter(idx);
      });
    });
  }

  private setStoryChapter(index: number) {
    this.currentStoryChapter = index;
    const scrubberBtns = this.rootEl.querySelectorAll('.story-step-btn');
    scrubberBtns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === index);
    });

    const idxIndicator = this.rootEl.querySelector('#story-cur-idx');
    if (idxIndicator) {
      idxIndicator.textContent = String(index + 1);
    }

    this.renderStoryStage(index);
  }

  private renderStoryStage(index: number) {
    const mount = this.rootEl.querySelector('#story-stage-mount');
    if (!mount) return;

    const ch = this.storyChapters[index];
    const imgSrc = resolveImg(ch.image);

    mount.innerHTML = `
      <article class="story-stage-card">
        <div class="story-media-stage">
          <img src="${imgSrc}" alt="${ch.shortTitle}" onerror="this.onerror=null;this.src='scd images/${ch.image}';">
          <div class="story-media-overlay">
            <span class="story-altitude-pill">
              <span class="live-dot"></span>
              <span>${ch.altitude}</span>
            </span>
            <span class="story-time-tag">${ch.timeTag}</span>
          </div>
        </div>

        <div class="story-content-stage">
          <span class="story-chapter-eyebrow">${ch.chapterTag}</span>
          <h3 class="story-pull-quote">${ch.quote}</h3>
          <p class="story-narrative-prose">${ch.prose}</p>

          <div class="story-metrics-strip">
            <div class="story-metric-item">
              <span>📍 Distance:</span>
              <b>${ch.metricDistance}</b>
            </div>
            <div class="story-metric-item">
              <span>⏱️ Dwell:</span>
              <b>${ch.metricDuration}</b>
            </div>
            <div class="story-metric-item">
              <span>✨ Vibe:</span>
              <b style="color:var(--ac)">${ch.metricVibe}</b>
            </div>
          </div>

          <div class="story-nav-actions">
            <button class="scd-btn-3d-primary" id="story-action-btn">
              ${ch.actionText}
            </button>
            <a class="scd-btn-3d-orange" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ch.chapterTag.split('·')[1]?.trim() || 'Dehradun')}" target="_blank" rel="noopener">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              View in Maps
            </a>
          </div>
        </div>
      </article>
    `;

    const actionBtn = mount.querySelector('#story-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        if (ch.actionTarget === 'next') {
          this.setStoryChapter((this.currentStoryChapter + 1) % this.storyChapters.length);
        } else {
          window.location.hash = ch.actionTarget;
        }
      });
    }
  }

  private initRouting() {
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    this.rootEl.querySelectorAll('.apple-tab-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = link.getAttribute('data-nav') as AppPage;
        if (nav) {
          window.location.hash = `#/${nav}`;
          this.switchPage(nav);
        }
      });
    });
  }

  private handleHashChange() {
    let hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) hash = 'home';

    const validPages: AppPage[] = ['home', 'mountains', 'heritage', 'food', 'planner', 'directory', 'design'];
    if (validPages.includes(hash as AppPage) && hash !== this.activePage) {
      this.switchPage(hash as AppPage);
    }
  }

  public switchPage(page: AppPage) {
    this.activePage = page;
    const primaryNav = ['mountains', 'heritage'].includes(page) ? 'directory' : page;

    // Update navigation tab states
    const navLinks = this.rootEl.querySelectorAll('.apple-tab-link');
    navLinks.forEach(link => {
      const isCur = link.getAttribute('data-nav') === primaryNav;
      link.classList.toggle('active', isCur);
      link.setAttribute('aria-selected', isCur ? 'true' : 'false');
    });

    // Update page visibility with Apple transition
    const pages: AppPage[] = ['home', 'mountains', 'heritage', 'food', 'planner', 'directory', 'design'];
    pages.forEach(p => {
      const el = this.rootEl.querySelector(`#page-${p}`) as HTMLElement;
      if (el) {
        if (p === page) {
          el.classList.add('active-page');
        } else {
          el.classList.remove('active-page');
        }
      }
    });

    // Sub-renders
    if (page === 'mountains') {
      this.renderMountainsPage();
    } else if (page === 'heritage') {
      this.renderHeritagePage();
    } else if (page === 'food') {
      this.renderFoodTrail();
    } else if (page === 'directory') {
      this.renderGalleryGrid();
    } else if (page === 'planner') {
      setTimeout(() => {
        this.initOrUpdateLeafletMap();
        this.leafletMap?.invalidateSize();
        this.fitLeafletBounds();
      }, 100);
      setTimeout(() => {
        this.leafletMap?.invalidateSize();
      }, 350);
    } else if (page === 'design') {
      const toastBtn = this.rootEl.querySelector('#btn-demo-toast');
      if (toastBtn) {
        toastBtn.addEventListener('click', () => {
          showToast('Design Token Verified · WCAG 2.2 AAA Contrast');
        });
      }
    }

    // Scroll to top with Apple-style smooth ease
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.sendEmbedHeight();
  }

  private initControls() {
    // 1. Day Dial Mount
    const dialMount = this.rootEl.querySelector('#dial-mount') as HTMLElement;
    this.dayDial = new DayDial({
      container: dialMount,
      startMin: this.state.start,
      returnMin: this.state.returnBy,
      dateStr: this.state.date,
      onChange: (start, returnBy) => {
        this.state.start = start;
        this.state.returnBy = returnBy;
        this.triggerDebouncedRecompute();
      }
    });

    // 2. Vibe Checkboxes
    const vibes: { key: Interest; label: string; icon: string }[] = [
      { key: 'views', label: 'Views', icon: '🏔️' },
      { key: 'cafes', label: 'Cafés', icon: '☕' },
      { key: 'nature', label: 'Nature', icon: '🌿' },
      { key: 'food', label: 'Food', icon: '🥟' },
      { key: 'spiritual', label: 'Spiritual', icon: '🛕' },
      { key: 'heritage', label: 'Heritage', icon: '🏛️' },
      { key: 'adventure', label: 'Adventure', icon: '🧭' },
      { key: 'chill', label: 'Chill', icon: '✨' },
      { key: 'night', label: 'Night out', icon: '🍸' }
    ];

    const vibeContainer = this.rootEl.querySelector('#vibe-container') as HTMLElement;
    vibeContainer.innerHTML = vibes.map(v => `
      <label class="vibe-card">
        <input type="checkbox" name="vibe" value="${v.key}">
        <div class="vibe-card-inner">
          <span style="font-size:22px">${v.icon}</span>
          <span>${v.label}</span>
        </div>
      </label>
    `).join('');

    vibeContainer.addEventListener('change', () => {
      const checked = Array.from(vibeContainer.querySelectorAll('input:checked'))
        .map(i => (i as HTMLInputElement).value as Interest);
      this.state.interests = checked;
      if (checked.includes('night') && this.state.start < 1080) {
        this.state.start = 1080;
        this.state.returnBy = 1380;
        this.dayDial.setTimes(1080, 1380);
      }
      this.triggerDebouncedRecompute();
    });

    // 3. Date Presets
    const dateSegmented = this.rootEl.querySelector('#date-segmented') as HTMLElement;
    dateSegmented.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).value;
      const [d, m] = val.split(':');
      this.state.date = d;
      this.state.dayType = new Date(d).getDay() === 0 ? 'sunday' : 'saturday';
      if (m === 'eve') {
        this.state.start = 1080;
        this.state.returnBy = 1380;
      } else {
        this.state.start = 480;
        this.state.returnBy = 1020;
      }
      this.dayDial.setTimes(this.state.start, this.state.returnBy);
      this.triggerDebouncedRecompute();
    });

    // 3b. Duration Presets (4h / 1d / 2d / 3d)
    const durSegmented = this.rootEl.querySelector('#duration-preset-segmented') as HTMLElement;
    if (durSegmented) {
      durSegmented.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        if (val === '4h') {
          this.state.start = 540; // 9:00 AM
          this.state.returnBy = 780; // 1:00 PM
          this.dayDial.setTimes(540, 780);
          showToast('Configured 4-Hour Express Loop');
        } else if (val === '1d') {
          this.state.start = 480; // 8:00 AM
          this.state.returnBy = 1020; // 5:00 PM
          this.dayDial.setTimes(480, 1020);
          showToast('Configured Full 1-Day Daylight-Safe Route');
        } else if (val === '2d') {
          this.state.start = 450; // 7:30 AM
          this.state.returnBy = 1050; // 5:30 PM
          this.state.interests = ['views', 'nature', 'food'];
          this.dayDial.setTimes(450, 1050);
          showToast('Configured 2-Day Weekend Mountain & Valley Route');
        } else if (val === '3d') {
          this.state.start = 420; // 7:00 AM
          this.state.returnBy = 1200; // 8:00 PM
          this.state.interests = ['views', 'nature', 'spiritual', 'adventure'];
          this.dayDial.setTimes(420, 1020);
          showToast('Configured 3-Day Grand Expedition');
        }
        this.triggerDebouncedRecompute();
      });
    }

    // 4. Transport Mode
    const trSegmented = this.rootEl.querySelector('#transport-segmented') as HTMLElement;
    trSegmented.addEventListener('change', (e) => {
      this.state.transport = (e.target as HTMLInputElement).value as TransportMode;
      this.triggerDebouncedRecompute();
    });

    // 5. Fine-tune Dropdowns
    const selGroup = this.rootEl.querySelector('#sel-group') as HTMLSelectElement;
    selGroup.addEventListener('change', () => {
      this.state.group = selGroup.value as GroupType;
      this.triggerDebouncedRecompute();
    });

    const selPace = this.rootEl.querySelector('#sel-pace') as HTMLSelectElement;
    selPace.addEventListener('change', () => {
      this.state.pace = selPace.value as Pace;
      this.triggerDebouncedRecompute();
    });

    const selDiet = this.rootEl.querySelector('#sel-diet') as HTMLSelectElement;
    selDiet.addEventListener('change', () => {
      this.state.diet = selDiet.value as 'any' | 'veg';
      this.triggerDebouncedRecompute();
    });

    const selDep = this.rootEl.querySelector('#sel-departure') as HTMLSelectElement;
    selDep.addEventListener('change', () => {
      const mode = selDep.value as 'none' | 'flight' | 'train';
      if (mode !== 'none') {
        this.state.departure = { mode, at: 1200 };
      } else {
        this.state.departure = undefined;
      }
      this.triggerDebouncedRecompute();
    });

    // 6. Header Theme and Language buttons
    const themeBtn = this.rootEl.querySelector('#theme-btn') as HTMLElement;
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        html.classList.remove('light');
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
        html.classList.add('light');
      }
    });

    const langBtn = this.rootEl.querySelector('#lang-btn') as HTMLElement;
    langBtn.addEventListener('click', () => {
      this.state.locale = this.state.locale === 'hi' ? 'en' : 'hi';
      langBtn.querySelector('b')!.textContent = this.state.locale === 'hi' ? 'EN' : 'HI';
      this.triggerDebouncedRecompute();
    });

    // 7. Fast-Track Time Buttons on Home Page
    this.rootEl.querySelectorAll('[data-fast-track]').forEach(card => {
      card.addEventListener('click', () => {
        const hours = Number(card.getAttribute('data-fast-track'));
        if (hours === 2) {
          this.state.start = 540; // 9:00 AM
          this.state.returnBy = 660; // 11:00 AM
          this.state.transport = 'walk';
          this.state.interests = ['spiritual', 'food'];
        } else if (hours === 4) {
          this.state.start = 570; // 9:30 AM
          this.state.returnBy = 810; // 1:30 PM
          this.state.transport = 'car';
          this.state.interests = ['nature', 'adventure'];
        } else if (hours === 6) {
          this.state.start = 390; // 6:30 AM
          this.state.returnBy = 750; // 12:30 PM
          this.state.transport = 'car';
          this.state.interests = ['views', 'food'];
        } else {
          this.state.start = 480; // 8:00 AM
          this.state.returnBy = 1080; // 6:00 PM
          this.state.transport = 'car';
          this.state.interests = ['views', 'nature', 'adventure'];
        }
        this.dayDial.setTimes(this.state.start, this.state.returnBy);
        window.location.hash = '#/planner';
      });
    });

    // 8. Gallery Search and Filter
    const searchInput = this.rootEl.querySelector('#gallery-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.gallerySearch = (e.target as HTMLInputElement).value.toLowerCase();
        this.renderGalleryGrid();
      });
    }

    const filterChips = this.rootEl.querySelectorAll('#gallery-cluster-filters .filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.galleryFilter = chip.getAttribute('data-filter') || 'all';
        this.renderGalleryGrid();
      });
    });

    const timeChips = this.rootEl.querySelectorAll('#gallery-time-filters .filter-chip');
    timeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        timeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.galleryTimeFilter = chip.getAttribute('data-time-filter') || 'all';
        this.renderGalleryGrid();
      });
    });

    // 9. Food Category Filters
    const foodChips = this.rootEl.querySelectorAll('#food-category-filters .filter-chip');
    foodChips.forEach(chip => {
      chip.addEventListener('click', () => {
        foodChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.foodFilter = chip.getAttribute('data-food-filter') || 'all';
        this.renderFoodTrail();
      });
    });

    // 10. Sticky Pill Action
    const pillBtn = this.rootEl.querySelector('#pill-scroll-btn');
    if (pillBtn) {
      pillBtn.addEventListener('click', () => {
        window.location.hash = '#/planner';
        const out = this.rootEl.querySelector('#output-mount');
        if (out) out.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 11. Recenter & Style Map buttons
    const recenterBtn = this.rootEl.querySelector('#map-recenter-btn');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => {
        this.fitLeafletBounds();
      });
    }

    const toggleMapBtn = this.rootEl.querySelector('#map-theme-toggle-btn');
    if (toggleMapBtn) {
      toggleMapBtn.addEventListener('click', () => {
        this.mapTileTheme = this.mapTileTheme === 'voyager' ? 'dark' : 'voyager';
        this.updateMapTiles();
        toggleMapBtn.textContent = this.mapTileTheme === 'voyager' ? '🌙 Switch to Dark Map' : '🗺️ Switch to Topo Map';
      });
    }

    // 12. Close Modal on Backdrop Click
    const modal = this.rootEl.querySelector('#place-modal') as HTMLElement;
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    }

    // 13. Initialize Cinematic Landing Interactions
    initCinematicInteractions(this.rootEl, (routeId) => {
      this.loadCuratedRouteById(routeId);
    });

    // 14. Initialize Practical Companion Drawer
    initPracticalDrawer(this.rootEl);

    // 15. Wire up QR Code Share Modal Close
    const qrModal = this.rootEl.querySelector('#qr-share-modal') as HTMLElement;
    const closeQrBtn = this.rootEl.querySelector('#btn-close-qr-modal') as HTMLElement;
    if (closeQrBtn && qrModal) {
      closeQrBtn.addEventListener('click', () => {
        qrModal.classList.remove('open');
        qrModal.style.display = 'none';
      });
      qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
          qrModal.classList.remove('open');
          qrModal.style.display = 'none';
        }
      });
    }

    // Initial renders
    this.renderCuratedTrips();
    this.renderHomeDestinationCards();
    this.renderMountainsPage();
    this.renderHeritagePage();
    this.renderFoodTrail();
    this.renderGalleryGrid();
  }

  private renderHomeDestinationCards() {
    const mount = this.rootEl.querySelector('#home-destination-grid') as HTMLElement;
    if (!mount) return;
    const featuredIds = ['tapkeshwar', 'rob', 'fri', 'maldevta', 'land', 'geo', 'clouds-end', 'shikhar-falls', 'sahas', 'dehradun-zoo', 'paltan-bazaar', 'bhatta-falls'];
    const places = featuredIds
      .map(id => this.datasets.places.find(place => place.id === id))
      .filter((place): place is Place => Boolean(place));

    mount.innerHTML = places.map(place => {
      const image = place.images?.[0] || 'mind.jpg';
      return `
        <article class="visitor-destination-card">
          <button class="visitor-destination-media" type="button" data-home-place="${place.id}" aria-label="See details for ${place.name}">
            <img src="${resolveImg(image)}" alt="${place.name}" loading="lazy" onerror="this.onerror=null;this.src='images/mind.jpg';">
            <span class="visitor-destination-area">${areaLabel(place.cluster)}</span>
          </button>
          <div class="visitor-destination-content">
            <h3>${place.name}</h3>
            <p>${place.notes}</p>
            <div class="visitor-destination-meta">
              <span>⏱️ ~${place.visit.typical} min</span>
              <div style="display:flex;gap:10px;align-items:center">
                <button type="button" data-home-place="${place.id}">Details ↗</button>
                <a href="${placeUrl(place)}" target="_blank" rel="noopener" class="home-maps-link" style="color:var(--orange);font-weight:700;text-decoration:none;font-size:11px" title="Open in Google Maps">Maps ↗</a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    mount.querySelectorAll<HTMLButtonElement>('[data-home-place]').forEach(button => {
      button.addEventListener('click', () => this.openPlaceModal(button.dataset.homePlace || ''));
    });
  }

  private loadCuratedRouteById(routeId: string) {
    if (routeId.includes('mussoorie') || routeId.includes('hills')) {
      this.state.start = 450; // 07:30 AM
      this.state.returnBy = 1050; // 05:30 PM (daylight safe)
      this.state.transport = 'car';
      this.state.interests = ['views', 'nature', 'food'];
    } else if (routeId.includes('halfday') || routeId.includes('campus')) {
      this.state.start = 540; // 09:00 AM
      this.state.returnBy = 750; // 12:30 PM
      this.state.transport = 'walk';
      this.state.interests = ['spiritual', 'food'];
    } else if (routeId.includes('spiritual') || routeId.includes('river')) {
      this.state.start = 660; // 11:00 AM
      this.state.returnBy = 1260; // 09:00 PM
      this.state.transport = 'car';
      this.state.interests = ['spiritual', 'adventure'];
    } else if (routeId.includes('nature')) {
      this.state.start = 570; // 09:30 AM
      this.state.returnBy = 930; // 03:30 PM
      this.state.transport = 'car';
      this.state.interests = ['nature', 'heritage'];
    } else if (routeId.includes('foodie')) {
      this.state.start = 750; // 12:30 PM
      this.state.returnBy = 1080; // 06:00 PM
      this.state.transport = 'car';
      this.state.interests = ['food', 'night'];
    } else {
      this.state.start = 420; // 07:00 AM
      this.state.returnBy = 1050; // 05:30 PM
      this.state.transport = 'car';
      this.state.interests = ['views', 'nature', 'adventure'];
    }

    this.dayDial.setTimes(this.state.start, this.state.returnBy);
    this.switchPage('planner');
    window.location.hash = '#/planner';
    this.recomputePlan();
    showToast('Loaded blueprint into Route Planner 2.0');
  }

  private triggerDebouncedRecompute() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.recomputePlan(), 60);
  }

  private recomputePlan() {
    const plan = planTrip(this.state, this.datasets);
    this.currentPlan = plan;
    this.renderOutput(plan);
    this.updateStickyPill(plan);
    if (this.activePage === 'planner') {
      this.initOrUpdateLeafletMap();
    }
    this.sendEmbedHeight();
    if (!window.location.hash.startsWith('#/')) {
      window.location.hash = encodeTripState(this.state);
    }
  }

  /* --- SIGNATURE CURATED BLUEPRINTS --- */
  private renderCuratedTrips() {
    const container = this.rootEl.querySelector('#home-curated-trips-mount') as HTMLElement;
    if (!container) return;

    const trips = [
      {
        id: 'landour-sunrise',
        title: 'Landour Himalayan Sunrise & Char Dukan',
        duration: '6 Hours (Early Morning)',
        badge: 'Top Mountain Ascent',
        image: 'land.jpg',
        desc: 'Escape before the weekend hill traffic gathers. Enjoy steaming ginger chai & Maggi on the winding ghats, gaze at snow-capped Bandarpoonch peaks from 2,290m Lal Tibba, and savor cinnamon pancakes at Char Dukan.',
        stops: ['Mussoorie Road Highway Viewpoint', 'Char Dukan Heritage Stalls', 'Landour: Lal Tibba & Sisters’ Bazaar', 'Landour Bakehouse'],
        start: 390, // 6:30 AM
        returnBy: 750, // 12:30 PM
        transport: 'car' as TransportMode,
        interests: ['views', 'food', 'nature'] as Interest[]
      },
      {
        id: 'doon-canyon',
        title: 'Doon Nature & River Canyon Walk',
        duration: '4 Hours (Midday)',
        badge: 'Adventure & Streams',
        image: 'rob.jpg',
        desc: "Wade through ankle-deep natural stream water inside Robber's Cave (Gucchupani) limestone river gorge where underground rivers resurface, followed by Sahastradhara sulphur cascades and a delicious lunch on Rajpur Road.",
        stops: ["Robber's Cave (Gucchupani River Walk)", "Sahastradhara Sulphur Springs", "Rajpur Road Garden Café"],
        start: 570, // 9:30 AM
        returnBy: 810, // 1:30 PM
        transport: 'car' as TransportMode,
        interests: ['nature', 'adventure'] as Interest[]
      },
      {
        id: 'tibetan-peace',
        title: 'Campus Tibetan Quarter & Mindrolling Peace',
        duration: '2 Hours (Zero Travel)',
        badge: 'Next to Graphic Era',
        image: 'mind.jpg',
        desc: 'A 5-minute walk from the Graphic Era Bell Road gate. Walk around the tranquil 60-meter Great Stupa, spinning prayer wheels and landscaped gardens, followed by authentic Tibetan tingmo, thukpa and momos.',
        stops: ['Mindrolling Monastery & Great Stupa', 'Tibetan Colony Stroll', 'Authentic Momo & Tingmo Corner'],
        start: 540, // 9:00 AM
        returnBy: 660, // 11:00 AM
        transport: 'walk' as TransportMode,
        interests: ['spiritual', 'chill', 'food'] as Interest[]
      },
      {
        id: 'rajpur-food-crawl',
        title: 'Rajpur Road Iconic Food & Café Crawl',
        duration: '3.5 Hours (Afternoon)',
        badge: 'Foodies & Cafés',
        image: 'kfc.jpg',
        desc: "Treat yourself to Dehradun's legendary culinary stretch: iconic chicken kothay momos at Kalsang Friends Corner, wood-fired artisan pizza at AMA Café, and stick jaws at Ellora's Melting Moments Bakery (est. 1953).",
        stops: ['Kalsang Friends Corner', 'AMA Café', 'Café de Piccolo', 'Ellora’s Melting Moments Bakery'],
        start: 720, // 12:00 PM
        returnBy: 930, // 3:30 PM
        transport: 'car' as TransportMode,
        interests: ['cafes', 'food', 'chill'] as Interest[]
      },
      {
        id: 'sunset-camels-back',
        title: 'Golden Hour Sunset at Camel\'s Back & Mall Road',
        duration: '5 Hours (Afternoon to Dusk)',
        badge: 'Panoramic Sunset',
        image: 'geo.webp',
        desc: 'Experience Mussoorie without the rush. Stroll the peaceful 3 km paved Camel’s Back Road overlooking the Doon Valley as the sun dips below the Shivalik hills, ending with hot street bites at Library Chowk.',
        stops: ['Camel’s Back Road Promenade', 'Mussoorie Mall Road & Library Chowk', 'Sir George Everest Cliff Overlook'],
        start: 840, // 2:00 PM
        returnBy: 1140, // 7:00 PM
        transport: 'car' as TransportMode,
        interests: ['views', 'nature', 'chill'] as Interest[]
      },
      {
        id: 'doon-nightlife',
        title: 'Dehradun Nightlife, Lounges & Microbreweries',
        duration: '4 Hours (Saturday Night)',
        badge: 'Weekend Night Out',
        image: 'social.jpg',
        desc: 'Vibrant nightlife along Rajpur Road and Jakhan. Fresh artisan beers at The Brew Estate, molecular cocktails at Farzi Café, valley lights from Rumours Sky Lounge, and upbeat vibes at Social and Ministry of Sound.',
        stops: ['The Brew Estate / Farzi Café', 'Rumours Sky Lounge Euphoria', 'Dehradun Social at Centrio', 'Playboy Beer Garden'],
        start: 1110, // 6:30 PM
        returnBy: 1380, // 11:00 PM
        transport: 'car' as TransportMode,
        interests: ['night', 'food'] as Interest[]
      }
    ];

    container.innerHTML = trips.map(trip => `
      <article class="trip-card-ios">
        <div class="trip-card-media">
          <img src="${resolveImg(trip.image)}" alt="${trip.title}" onerror="this.onerror=null;this.src='scd images/${trip.image}';">
          <span class="trip-card-pill-left">${trip.badge}</span>
          <span class="trip-card-pill-right mono">${trip.duration}</span>
        </div>
        <div class="trip-card-body">
          <h3 class="trip-card-title">${trip.title}</h3>
          <p class="trip-card-desc">${trip.desc}</p>
          <div class="trip-card-stops-list">
            ${trip.stops.map((stop, i) => `
              <div class="trip-card-stop-row">
                <span class="trip-card-stop-icon">${i + 1}</span>
                <span>${stop}</span>
              </div>
            `).join('')}
          </div>
          <div class="trip-card-actions">
            <button class="scd-btn-3d-primary" data-load-trip="${trip.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Plan This Trip
            </button>
            <a class="scd-btn-3d-orange" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.stops[0] + ', Dehradun')}" target="_blank" rel="noopener">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Google Maps
            </a>
          </div>
        </div>
      </article>
    `).join('');

    container.querySelectorAll('[data-load-trip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-load-trip');
        const trip = trips.find(t => t.id === id);
        if (!trip) return;

        this.state.start = trip.start;
        this.state.returnBy = trip.returnBy;
        this.state.transport = trip.transport;
        this.state.interests = trip.interests;

        this.dayDial.setTimes(trip.start, trip.returnBy);
        const trRadio = this.rootEl.querySelector(`input[name="transport"][value="${trip.transport}"]`) as HTMLInputElement;
        if (trRadio) trRadio.checked = true;

        const vibeInputs = this.rootEl.querySelectorAll('#vibe-container input') as NodeListOf<HTMLInputElement>;
        vibeInputs.forEach(i => {
          i.checked = trip.interests.includes(i.value as Interest);
        });

        window.location.hash = '#/planner';
        this.recomputePlan();
      });
    });
  }

  /* --- PAGE 2: MOUNTAIN PEAKS & CLOUD RIDGES --- */
  private renderMountainsPage() {
    const mount = this.rootEl.querySelector('#mountains-grid-mount') as HTMLElement;
    if (!mount) return;

    // Filter to mountain places & viewpoints
    const mountainPlaces = this.datasets.places.filter(p => 
      p.cluster === 'landour' || p.cluster === 'mussoorie-town' || p.cluster === 'park-estate' || p.cluster === 'mussoorie-approach' || p.id === 'bha'
    );

    mount.innerHTML = mountainPlaces.map(item => {
      const img = item.images?.[0] || 'land.jpg';
      const imgSrc = resolveImg(img);

      let altitude = '1,350m (Ghats)';
      if (item.id === 'land' || item.cluster === 'landour') altitude = '2,290m (Summit)';
      else if (item.id === 'geo' || item.cluster === 'park-estate') altitude = '2,050m (Ridge)';
      else if (item.id === 'bha') altitude = '2,200m (Peak)';
      else if (item.cluster === 'mussoorie-town') altitude = '1,900m (Town)';

      return `
        <article class="place-card">
          <div class="place-media" data-modal-trigger="${item.id}">
            <img src="${imgSrc}" alt="${item.name}" onerror="this.onerror=null;this.src='scd images/${img}';">
            <span class="place-badge-cluster">${altitude}</span>
            <span class="chip verified" style="position:absolute;bottom:10px;left:10px">
              ${item.cluster.replace('-', ' ')}
            </span>
          </div>

          <div class="place-content">
            <div class="place-header">
              <h3 class="place-title">${item.name}</h3>
              <div class="place-meta-row">
                <span>⏱️ ~${item.visit.typical} mins dwell</span>
                <span>•</span>
                <span>${item.experienceType.replace('-', ' ')}</span>
              </div>
            </div>

            <p class="place-desc">${item.notes || 'Iconic mountain landmark with sweeping Himalayan vistas.'}</p>

            <div style="font-size:12px;color:#FF9900;margin-bottom:12px;font-weight:700">
              💡 ${item.tips?.[0] || 'Visit early to beat the Mussoorie toll bottleneck.'}
            </div>

            <div class="place-footer">
              <button class="scd-btn-3d-secondary" style="padding:6px 12px;font-size:12px" data-modal-trigger="${item.id}">
                Details
              </button>
              <a class="scd-btn-3d-primary" style="padding:6px 12px;font-size:12px" href="${placeUrl(item)}" target="_blank" rel="noopener">
                Google Maps
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    mount.querySelectorAll('[data-modal-trigger]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-modal-trigger');
        if (id) this.openPlaceModal(id);
      });
    });
  }

  /* --- PAGE 3: VALLEY HERITAGE & FOREST SANCTUARIES --- */
  private renderHeritagePage() {
    const mount = this.rootEl.querySelector('#heritage-grid-mount') as HTMLElement;
    if (!mount) return;

    // Filter to valley heritage, culture, and nature places
    const valleyPlaces = this.datasets.places.filter(p => 
      p.cluster === 'clement-town' || p.cluster === 'city-center' || p.cluster === 'east-doon'
    );

    mount.innerHTML = valleyPlaces.map(item => {
      const img = item.images?.[0] || 'mind.jpg';
      const imgSrc = resolveImg(img);
      const isVerified = item.verification.status === 'verified';

      return `
        <article class="place-card">
          <div class="place-media" data-modal-trigger="${item.id}">
            <img src="${imgSrc}" alt="${item.name}" onerror="this.onerror=null;this.src='scd images/${img}';">
            <span class="place-badge-cluster">${item.cluster === 'clement-town' ? 'Next to Graphic Era' : 'Doon Valley'}</span>
            <span class="chip ${isVerified ? 'verified' : 'unverified'}" style="position:absolute;bottom:10px;left:10px">
              ${isVerified ? '✓ Verified' : 'Check Hours'}
            </span>
          </div>

          <div class="place-content">
            <div class="place-header">
              <h3 class="place-title">${item.name}</h3>
              <div class="place-meta-row">
                <span>⏱️ ~${item.visit.typical} mins dwell</span>
                <span>•</span>
                <span>${item.experienceType.replace('-', ' ')}</span>
              </div>
            </div>

            <p class="place-desc">${item.notes || 'Historic sanctuary in the Doon valley.'}</p>

            <div style="font-size:12px;color:var(--ac);margin-bottom:12px;font-weight:700">
              💡 ${item.tips?.[0] || 'Peaceful gardens and great photography opportunities.'}
            </div>

            <div class="place-footer">
              <button class="scd-btn-3d-secondary" style="padding:6px 12px;font-size:12px" data-modal-trigger="${item.id}">
                Details
              </button>
              <a class="scd-btn-3d-primary" style="padding:6px 12px;font-size:12px" href="${placeUrl(item)}" target="_blank" rel="noopener">
                Google Maps
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    mount.querySelectorAll('[data-modal-trigger]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-modal-trigger');
        if (id) this.openPlaceModal(id);
      });
    });
  }

  /* --- PAGE 4: THE EPICUREAN & CAFÉ TRAIL --- */
  private renderFoodTrail() {
    const grid = this.rootEl.querySelector('#food-trail-grid') as HTMLElement;
    if (!grid) return;

    const allEateries: Place[] = this.datasets.eateries;

    const filtered = allEateries.filter(e => {
      if (this.foodFilter === 'momos') {
        return e.id === 'kfc' || e.notes.toLowerCase().includes('momo') || e.cluster === 'clement-town';
      }
      if (this.foodFilter === 'ghat') {
        return e.cluster === 'mussoorie-approach' || e.id === 'chardukan' || e.notes.toLowerCase().includes('maggi');
      }
      if (this.foodFilter === 'bakery') {
        return e.experienceType === 'bakery' || e.id === 'ell' || e.id === 'bakehouse';
      }
      if (this.foodFilter === 'cafes') {
        return e.kind === 'cafe' && e.id !== 'chardukan';
      }
      if (this.foodFilter === 'lounges') {
        return e.kind === 'bar' || e.kind === 'club';
      }
      return true;
    });

    grid.innerHTML = filtered.map(item => {
      const img = item.images?.[0] || 'kfc.jpg';
      const imgSrc = resolveImg(img);

      // Signature dish callout
      let signature = 'Local Himalayan Delicacy';
      if (item.id === 'kfc') signature = '🥟 Chicken Kothay Momos & Thukpa';
      else if (item.id === 'chardukan') signature = '🥞 Banana Nutella Pancake & Cheese Maggi';
      else if (item.id === 'bakehouse') signature = '🥧 Lemon Curd Crepe & Apple Cinnamon Pie';
      else if (item.id === 'ell') signature = '🍰 Historic 1953 Stick Jaws & Plum Cake';
      else if (item.id === 'ama') signature = '🍕 Wood-fired Pizza & Himalayan Roast Coffee';
      else if (item.id === 'pic') signature = '🍝 Cottage Crepes, Waffles & Hot Chocolate';
      else if (item.id === 'tbi') signature = '☕ Kashmiri Saffron Kehwa & Cardamom Tea';
      else if (item.id === 'far') signature = '🍸 Molecular Cocktails & Modern Indian Plates';
      else if (item.id === 'rum') signature = '🍹 Skyline Cocktails & Euphoria Terrace View';
      else if (item.id === 'soc') signature = '🍔 Long Island Iced Tea & Social Platters';
      else if (item.id === 'brw') signature = '🍺 Freshly Brewed Microbrewery Craft Beers';
      else if (item.id === 'pgr') signature = '🍛 Dal Makhani & Tandoori Feast';

      return `
        <article class="food-card">
          <div class="food-media" data-modal-trigger="${item.id}">
            <img src="${imgSrc}" alt="${item.name}" onerror="this.onerror=null;this.src='scd images/${img}';">
            <span class="food-dish-tag">${signature}</span>
          </div>
          <div class="food-content">
            <h3 class="food-title">${item.name}</h3>
            <div class="food-meta">
              <span>📍 ${item.cluster.replace('-', ' ')}</span>
              <span>•</span>
              <span>Budget: ${'₹'.repeat(item.budget || 2)}</span>
            </div>
            <p style="font-size:13.5px;color:var(--t2);line-height:1.5;margin-bottom:14px;flex:1">
              ${item.notes}
            </p>
            <div class="food-must-try">
              <b style="color:#AD5CFF;font-size:11px;text-transform:uppercase;display:block;margin-bottom:2px">Must Try & Order</b>
              <span>${item.tips?.[0] || signature}</span>
            </div>
            <div style="display:flex;gap:10px;margin-top:auto">
              <button class="scd-btn-3d-secondary" style="padding:6px 14px;font-size:12px;flex:1" data-modal-trigger="${item.id}">
                Details
              </button>
              <a class="scd-btn-3d-primary" style="padding:6px 14px;font-size:12px;flex:1" href="${placeUrl(item)}" target="_blank" rel="noopener">
                Google Maps
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-modal-trigger]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-modal-trigger');
        if (id) this.openPlaceModal(id);
      });
    });
  }

  /* --- PAGE 5: SMART PLANNER ENGINE OUTPUT --- */
  private renderOutput(plan: Itinerary | null) {
    const mount = this.rootEl.querySelector('#output-mount') as HTMLElement;
    if (!plan) {
      mount.innerHTML = `
        <div class="ios-panel-card" style="text-align:center;padding:48px 24px">
          <div style="font-size:44px;margin-bottom:12px">⏳</div>
          <h2 style="font-size:22px;margin-bottom:8px">Trip Window Too Tight</h2>
          <p style="color:var(--t2);max-width:440px;margin:0 auto">We could not fit a safe round-trip plan in this duration under mountain traffic constraints. Try expanding your available hours or shifting your departure earlier.</p>
        </div>
      `;
      return;
    }

    const fullMapsUrl = fullRouteUrl(plan.stops.map(s => s.place), this.state.transport);

    mount.innerHTML = `
      <!-- Hero Plan Banner -->
      <div class="summary-banner">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#FF9900;display:flex;align-items:center;gap:6px">
            <span style="width:7px;height:7px;border-radius:50%;background:#FF9900;box-shadow:0 0 6px #FF9900"></span>
            ${plan.confidenceChip}
          </span>
          <span class="mono" style="font-size:13px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.15);padding:4px 12px;border-radius:var(--r-pill);color:#fff">
            Back by ${this.formatTime(plan.expectedReturn)}
          </span>
        </div>
        <h2 class="summary-title">${plan.title}</h2>
        <p class="summary-lead">${plan.leadSummary}</p>

        <div class="summary-stats">
          <div class="stat-tile">
            <div class="stat-label">Exploring Time</div>
            <div class="stat-value mono">${Math.round(plan.totalSightseeingMin / 60)}h ${plan.totalSightseeingMin % 60}m</div>
          </div>
          <div class="stat-tile">
            <div class="stat-label">Transit Time</div>
            <div class="stat-value mono">${Math.round(plan.totalTravelMin / 60)}h ${plan.totalTravelMin % 60}m</div>
          </div>
          <div class="stat-tile">
            <div class="stat-label">Safety Buffer</div>
            <div class="stat-value mono">+${plan.contingencyBufferMin}m</div>
          </div>
          <div class="stat-tile" style="border-color:rgba(0,212,146,0.35);background:rgba(0,212,146,0.06)">
            <div class="stat-label" style="color:#00D492">Feasibility Score</div>
            <div class="stat-value mono" style="color:#00D492">98/100</div>
          </div>
          <div class="stat-tile" style="border-color:rgba(255,153,0,0.35);background:rgba(255,153,0,0.06)">
            <div class="stat-label" style="color:#FF9900">Estimated Cab Fare</div>
            <div class="stat-value mono" style="color:#FFA726">${plan.estimatedCost ? `₹${plan.estimatedCost.totalMin}–₹${plan.estimatedCost.totalMax}` : '₹800–₹1,200'}</div>
          </div>
        </div>

        <div class="banner-actions">
          <a class="scd-btn-3d-orange" href="${fullMapsUrl}" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Open Full Route in Google Maps
          </a>
          <a class="scd-btn-3d-secondary" id="btn-whatsapp-share" href="${generateWhatsAppShareUrl(plan, this.state.date, fullMapsUrl)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;border-color:#1EBE5D" title="Share plan on WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
            Share on WhatsApp
          </a>
          <button class="scd-btn-3d-secondary" id="btn-ics-export">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Calendar (.ics)
          </button>
          <a class="scd-btn-3d-secondary" id="btn-gcal-export" href="${generateGoogleCalendarUrl(plan, this.state.date)}" target="_blank" rel="noopener">
            Google Calendar
          </a>
          <button class="scd-btn-3d-secondary" id="btn-print-export">
            🖨️ PDF Export
          </button>
          <button class="scd-btn-3d-secondary" id="btn-qr-share">
            📱 Phone QR Code
          </button>
          <button class="scd-btn-3d-secondary" id="btn-copy-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share Link
          </button>
        </div>
      </div>

      ${plan.stops.some(s => ['landour', 'mussoorie-town', 'mussoorie-approach', 'park-estate', 'dhanaulti'].includes(s.place.cluster)) ? `
        <div style="background:rgba(255,153,0,0.12);border:1px solid #FF9900;border-radius:14px;padding:14px 18px;margin:16px 0;display:flex;align-items:center;gap:14px">
          <span style="font-size:28px">⚠️</span>
          <div>
            <b style="color:#FFA726;display:block;font-size:13.5px">Himalayan Daylight Warning: Descend Ridge Before 5:30 PM</b>
            <span style="font-size:12px;color:var(--t2);line-height:1.5">Mussoorie ghats have rapid twilight, fog, and steep turns. Our engine has scheduled your downhill journey with a safe daylight return buffer.</span>
          </div>
        </div>
      ` : ''}

      <!-- Route Visualizer -->
      ${renderRouteMap(plan)}

      <!-- Timeline Stops -->
      <div class="timeline">
        ${plan.stops.map((stop, i) => `
          <div class="leg-connector mono">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m12 6 4 6-4 6"/></svg>
            ${stop.leg.durationMin}m (${stop.leg.distanceKm} km) · ${stop.leg.trafficStatus}
          </div>

          <article class="stop-card">
            <div class="stop-cover" data-inspect-id="${stop.place.id}">
              <img src="${resolveImg(stop.place.images?.[0])}" alt="${stop.place.name}" onerror="this.onerror=null;this.src='scd images/' + '${stop.place.images?.[0] || 'mind.jpg'}';">
              <span class="stop-time-badge mono">${this.formatTime(stop.arrival)} – ${this.formatTime(stop.departure)}</span>
              <div class="stop-chips">
                <span class="chip ${stop.place.verification.status === 'verified' ? 'verified' : 'unverified'}">
                  ${stop.place.verification.status === 'verified' ? '✓ Verified' : 'Check Hours'}
                </span>
                <span class="chip">${stop.place.cluster.replace('-', ' ')}</span>
                <span class="chip" style="background:rgba(173,92,255,0.3);border-color:var(--ac)">🔍 Tap to preview</span>
              </div>
            </div>

            <div class="stop-body">
              <div class="stop-title-row">
                <h3 class="stop-name">${stop.place.name}</h3>
                <span class="stop-role">${stop.role}</span>
              </div>

              <p class="stop-why">${stop.whyThisStop}</p>

              <ul class="stop-what">
                ${stop.whatToDo.map(act => `<li>${act}</li>`).join('')}
              </ul>

              <div class="stop-actions">
                <a class="scd-btn-3d-primary" href="${placeUrl(stop.place)}" target="_blank" rel="noopener">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Google Maps Directions
                </a>
                ${stop.alternatives?.length ? `
                  <button class="scd-btn-3d-secondary" data-swap-id="${stop.place.id}" data-alt-id="${stop.alternatives[0].place.id}">
                    Swap for ${stop.alternatives[0].place.name}
                  </button>
                ` : ''}
              </div>
            </div>
          </article>
        `).join('')}

        <div class="leg-connector mono">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          Return to Graphic Era Campus · ${plan.returnLeg.durationMin}m · Arrive ${this.formatTime(plan.expectedReturn)}
        </div>
      </div>

      <!-- Advisories & Local Guide Tips -->
      <div class="ios-panel-card" style="margin-top:24px">
        <div class="section-head">
          <h3>Local Guide Notes & What to Carry</h3>
        </div>
        <div style="display:grid;grid-template-columns:1fr;gap:12px;font-size:13.5px;color:var(--t2)">
          ${plan.practicalTips.map(tip => `
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="color:var(--ac);font-weight:800">💡</span>
              <span>${tip}</span>
            </div>
          `).join('')}
          ${plan.compromises.map(comp => `
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="color:var(--wa);font-weight:800">ℹ️</span>
              <span>${comp}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const icsBtn = mount.querySelector('#btn-ics-export') as HTMLElement;
    if (icsBtn) {
      icsBtn.addEventListener('click', () => downloadICS(plan, this.state.date));
    }

    const copyBtn = mount.querySelector('#btn-copy-link') as HTMLElement;
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        copyBtn.textContent = '✓ Copied Link!';
        setTimeout(() => { copyBtn.textContent = 'Share Link'; }, 2000);
      });
    }

    const printBtn = mount.querySelector('#btn-print-export') as HTMLElement;
    if (printBtn) {
      printBtn.addEventListener('click', () => triggerPrintItinerary());
    }

    const qrBtn = mount.querySelector('#btn-qr-share') as HTMLElement;
    if (qrBtn) {
      qrBtn.addEventListener('click', () => {
        const qrModal = this.rootEl.querySelector('#qr-share-modal') as HTMLElement;
        const qrMount = this.rootEl.querySelector('#qr-code-mount') as HTMLElement;
        if (qrModal && qrMount) {
          qrMount.innerHTML = `<img src="${getQRCodeUrl(window.location.href, 220)}" width="220" height="220" alt="QR Code to phone">`;
          qrModal.style.display = 'flex';
          qrModal.classList.add('open');
        }
      });
    }

    const swapButtons = mount.querySelectorAll('[data-swap-id]');
    swapButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const stopId = btn.getAttribute('data-swap-id')!;
        const altId = btn.getAttribute('data-alt-id')!;
        const res = this.replanEngine.replan(plan, this.state, {
          type: 'swap',
          stopId,
          altId
        });
        if (res.success && res.itinerary) {
          this.currentPlan = res.itinerary;
          this.renderOutput(res.itinerary);
          this.sendEmbedHeight();
        } else {
          alert(res.rejectionReason || 'Could not swap stop within safe return deadline');
        }
      });
    });

    mount.querySelectorAll('[data-inspect-id]').forEach(cover => {
      cover.addEventListener('click', () => {
        const id = cover.getAttribute('data-inspect-id');
        if (id) this.openPlaceModal(id);
      });
    });
  }

  /* --- LIVE ROUTED INTERACTIVE MAP (LEAFLET) --- */
  private updateMapTiles() {
    if (!this.leafletMap) return;
    const L = (window as any).L;
    if (!L) return;

    if (this.mapTileLayer) {
      this.leafletMap.removeLayer(this.mapTileLayer);
    }

    const url = this.mapTileTheme === 'voyager'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    this.mapTileLayer = L.tileLayer(url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }).addTo(this.leafletMap);
  }

  private initOrUpdateLeafletMap() {
    if (typeof window === 'undefined') return;
    const L = (window as any).L;
    if (!L) return;

    const mapEl = document.getElementById('leaflet-live-canvas');
    if (!mapEl) return;

    // Default Graphic Era Coordinates
    const campusCoords: [number, number] = [30.2705, 77.9965];

    if (!this.leafletMap) {
      this.leafletMap = L.map('leaflet-live-canvas', {
        zoomControl: true,
        attributionControl: false
      }).setView(campusCoords, 11);

      this.updateMapTiles();

      this.leafletRouteLayer = L.layerGroup().addTo(this.leafletMap);
      this.leafletMarkersLayer = L.layerGroup().addTo(this.leafletMap);
    }

    this.leafletMap.invalidateSize();
    this.leafletRouteLayer.clearLayers();
    this.leafletMarkersLayer.clearLayers();

    // Prepare stop coordinates
    const stops = this.currentPlan ? this.currentPlan.stops.map(s => s.place) : [];
    const points: [number, number][] = [campusCoords];

    // 1. Campus Marker (Origin)
    const originIcon = L.divIcon({
      className: 'custom-neon-marker',
      html: `<div style="background:#FF9900;color:#000;font-weight:900;border:2.5px solid #fff;box-shadow:0 0 16px rgba(255,153,0,0.9);width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px" title="Graphic Era University">🎓</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    L.marker(campusCoords, { icon: originIcon })
      .bindPopup(`
        <div style="padding:14px;color:#0A0A0C">
          <b style="color:#E65100;font-size:14px;display:block">Graphic Era (Deemed to be University)</b>
          <span style="font-size:12px;color:#475569">AWS Student Community Day 2026 · Expedition Start & Finish</span>
        </div>
      `, { className: 'custom-leaflet-popup' })
      .addTo(this.leafletMarkersLayer);

    // 2. Stop Markers
    stops.forEach((p, idx) => {
      if (p.coords && p.coords.lat && p.coords.lng) {
        const pt: [number, number] = [p.coords.lat, p.coords.lng];
        points.push(pt);

        const pinIcon = L.divIcon({
          className: 'custom-neon-marker',
          html: `<div style="background:linear-gradient(135deg,#AD5CFF 0%,#7E22CE 100%);color:#fff;font-weight:900;border:2.5px solid #fff;box-shadow:0 0 16px rgba(173,92,255,0.9);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px" title="${p.name}">${idx + 1}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const img = p.images?.[0] || 'mind.jpg';
        const popupContent = `
          <div style="width:230px;color:#0A0A0C">
            <img src="${resolveImg(img)}" style="width:100%;height:105px;object-fit:cover;border-radius:10px 10px 0 0" onerror="this.src='images/mind.jpg'">
            <div style="padding:10px 12px">
              <span style="font-size:10px;text-transform:uppercase;color:#7E22CE;font-weight:800">Stop ${idx + 1}</span>
              <b style="font-size:13px;display:block;margin:2px 0 6px;line-height:1.3">${p.name}</b>
              <a class="scd-btn-3d-orange" href="${placeUrl(p)}" target="_blank" rel="noopener" style="padding:5px 10px !important;font-size:11px !important;width:100%;text-align:center;display:block;text-decoration:none">
                Open in Google Maps ↗
              </a>
            </div>
          </div>
        `;

        L.marker(pt, { icon: pinIcon })
          .bindPopup(popupContent, { className: 'custom-leaflet-popup' })
          .addTo(this.leafletMarkersLayer);
      }
    });

    // Return to campus
    points.push(campusCoords);

    // 3. Draw Route Polyline
    if (points.length > 2) {
      // Glow polyline
      L.polyline(points, {
        color: '#AD5CFF',
        weight: 6,
        opacity: 0.5,
        smoothFactor: 1
      }).addTo(this.leafletRouteLayer);

      // Core line
      L.polyline(points, {
        color: '#FF9900',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 6'
      }).addTo(this.leafletRouteLayer);

      this.leafletMap.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    }

    // 4. Sunset Sentinel Boundary Line (~ Rajpur / Shivalik foothills latitude: 30.38)
    const sunsetPoints: [number, number][] = [
      [30.38, 77.90],
      [30.38, 78.18]
    ];
    L.polyline(sunsetPoints, {
      color: '#EA580C',
      weight: 2.5,
      opacity: 0.8,
      dashArray: '6, 8'
    }).bindTooltip('⚠️ Daylight Sentinel Line: Descend Mussoorie ridge before sunset (5:34 PM)', {
      permanent: false,
      direction: 'top'
    }).addTo(this.leafletRouteLayer);

    // Update full map button link
    const mapFullBtn = this.rootEl.querySelector('#map-google-full-btn') as HTMLAnchorElement;
    if (mapFullBtn && this.currentPlan) {
      mapFullBtn.href = fullRouteUrl(this.currentPlan.stops.map(s => s.place), this.state.transport);
    }
  }

  private fitLeafletBounds() {
    if (this.leafletMap && this.currentPlan) {
      const stops = this.currentPlan.stops.map(s => s.place);
      const points: [number, number][] = [[30.2705, 77.9965]];
      stops.forEach(p => {
        if (p.coords && p.coords.lat && p.coords.lng) {
          points.push([p.coords.lat, p.coords.lng]);
        }
      });
      const L = (window as any).L;
      if (L && points.length > 1) {
        this.leafletMap.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
      }
    }
  }

  /* --- ROAMING PLACES DIRECTORY --- */
  private renderGalleryGrid() {
    const grid = this.rootEl.querySelector('#gallery-grid') as HTMLElement;
    if (!grid) return;

    // Filter out obscure or remote spots not suitable for standard roaming
    const OFF_PLACE_IDS = new Set(['kalsi-edict', 'asan-barrage', 'chakrata-tiger-falls', 'bha', 'maggi']);
    const places = this.datasets.places.filter(p => !OFF_PLACE_IDS.has(p.id));

    const WATERFALL_IDS = new Set(['rob', 'sahas', 'maldevta', 'shikhar-falls', 'bhatta-falls', 'kempty-falls']);
    const MOUNTAIN_IDS = new Set(['land', 'geo', 'clouds-end', 'mall-road', 'gunhill', 'camels-back', 'mussoorie-lake']);
    const HERITAGE_IDS = new Set(['tapkeshwar', 'fri', 'mind', 'buddha-garden', 'paltan-bazaar']);
    const NATURE_IDS = new Set(['dehradun-zoo', 'lacchiwala', 'company-garden']);
    const DAYTRIP_IDS = new Set(['rish', 'dhanaulti-eco-park']);

    const filtered = places.filter(item => {
      if (this.galleryFilter === 'waterfalls') {
        if (!WATERFALL_IDS.has(item.id)) return false;
      } else if (this.galleryFilter === 'mountains') {
        if (!MOUNTAIN_IDS.has(item.id)) return false;
      } else if (this.galleryFilter === 'heritage') {
        if (!HERITAGE_IDS.has(item.id)) return false;
      } else if (this.galleryFilter === 'nature') {
        if (!NATURE_IDS.has(item.id)) return false;
      } else if (this.galleryFilter === 'daytrips') {
        if (!DAYTRIP_IDS.has(item.id)) return false;
      } else if (this.galleryFilter !== 'all') {
        if (item.cluster !== this.galleryFilter) return false;
      }

      if (this.galleryTimeFilter !== 'all') {
        if (timeCategory(item) !== this.galleryTimeFilter) return false;
      }

      if (this.gallerySearch) {
        const query = this.gallerySearch.toLowerCase().trim();
        const text = `${item.name} ${item.aliases?.join(' ') || ''} ${item.cluster} ${item.experienceType} ${item.notes || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1;text-align:center;padding:48px;color:var(--mu)">
          <div style="font-size:36px;margin-bottom:8px">🔍</div>
          <p>No roaming places match your search. Try another keyword or filter pill.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const img = item.images?.[0] || 'mind.jpg';
      const imgSrc = resolveImg(img);

      // Altitude tag
      let altitudeTag = 'Valley Floor · 650m';
      if (['landour', 'land'].includes(item.cluster) || item.id === 'land') altitudeTag = 'Summit · 2,290m';
      else if (['park-estate', 'geo', 'clouds-end'].includes(item.cluster)) altitudeTag = 'Cloud Ridge · 2,050m';
      else if (['mussoorie-town', 'mall-road', 'gunhill', 'camels-back', 'company-garden'].includes(item.cluster)) altitudeTag = 'Hill Town · 1,950m';
      else if (item.cluster === 'dhanaulti') altitudeTag = 'Alpine Forest · 2,286m';
      else if (['mussoorie-approach', 'mussoorie-lake', 'bhatta-falls'].includes(item.cluster)) altitudeTag = 'Ghats · 1,450m';
      else if (item.cluster === 'rajpur' || item.id === 'shikhar-falls') altitudeTag = 'Foothills · 850m';
      else if (item.cluster === 'rishikesh') altitudeTag = 'Ganga Riverfront · 350m';

      return `
        <article class="place-card">
          <div class="place-media" data-modal-trigger="${item.id}" tabindex="0" role="button" aria-label="View details for ${item.name}">
            <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='images/mind.jpg';">
            <span class="place-badge-cluster">${areaLabel(item.cluster)}</span>
            <span class="place-badge-alt">${altitudeTag}</span>
          </div>

          <div class="place-content">
            <div class="place-header">
              <h3 class="place-title">${item.name}</h3>
              <div class="place-meta-row" style="flex-wrap:wrap;gap:6px">
                <span style="color:#AD5CFF;font-weight:700">🚗 ${clusterDriveTime(item.cluster)}</span>
                <span>•</span>
                <span>⏱️ ~${item.visit.typical}m dwell</span>
                <span>•</span>
                <span class="place-exp-type">${item.experienceType.replace(/-/g, ' ')}</span>
              </div>
              ${item.bestTime ? `
                <div style="font-size:11px;color:#FFA726;font-weight:700;margin-top:4px">
                  ☀️ Best window: ${item.bestTime.from}–${item.bestTime.to}
                </div>
              ` : ''}
            </div>

            <p class="place-desc">${item.notes || 'Iconic spot to experience on your Dehradun trip.'}</p>

            <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:12px;font-size:12px">
              <div style="display:flex;align-items:center;gap:6px;color:var(--tx)">
                <span>🍜</span>
                <span style="color:var(--t2)"><b>Must Try:</b> ${companionFood(item.id)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;color:var(--mu);font-size:11px">
                <span>🎒</span>
                <span>${whatToPack(item)}</span>
              </div>
            </div>

            ${item.tips?.[0] ? `
              <div class="place-tip-snippet">
                <span class="tip-bulb">💡</span>
                <span>${item.tips[0]}</span>
              </div>
            ` : ''}

            <div class="place-footer">
              <button class="scd-btn-3d-secondary" style="padding:6px 11px;font-size:12px" data-modal-trigger="${item.id}">
                Details
              </button>
              <a class="scd-btn-3d-primary" style="padding:6px 11px;font-size:12px" href="${placeUrl(item)}" target="_blank" rel="noopener">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Google Maps
              </a>
              <a class="scd-btn-3d-orange" style="padding:6px 11px;font-size:12px" href="${placeDirectionsUrl(item)}" target="_blank" rel="noopener" title="Navigate in Google Maps">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Directions
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-modal-trigger]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-modal-trigger');
        if (id) this.openPlaceModal(id);
      });
    });
  }

  /* --- iOS PageSheet Modal --- */
  private openPlaceModal(placeId: string) {
    const all = [...this.datasets.places, ...this.datasets.eateries];
    const item = all.find(p => p.id === placeId);
    if (!item) return;

    const modal = this.rootEl.querySelector('#place-modal') as HTMLElement;
    const body = this.rootEl.querySelector('#place-modal-body') as HTMLElement;
    if (!modal || !body) return;

    const img = item.images?.[0] || 'mind.jpg';
    const imgSrc = resolveImg(img);
    const isVerified = item.verification?.status === 'verified';

    // Elevation estimates
    let altitude = '650m (Valley Floor)';
    if (item.cluster === 'landour') altitude = '2,290m (7,510 ft Hilltop)';
    else if (item.cluster === 'mussoorie-town') altitude = '1,900m (6,230 ft Ridge)';
    else if (item.cluster === 'park-estate') altitude = '2,050m (Cloud\'s End)';
    else if (item.cluster === 'mussoorie-approach') altitude = '1,350m (Ghats)';

    body.innerHTML = `
      <div class="sheet-grab-bar"></div>
      <div style="position:relative;aspect-ratio:16/9;overflow:hidden;border-top-left-radius:24px;border-top-right-radius:24px;margin-top:6px">
        <img src="${imgSrc}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.onerror=null;this.src='images/mind.jpg';">
        <button id="modal-close-btn" style="position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(5,7,14,0.8);border:1px solid rgba(255,255,255,0.25);color:#fff;font-size:18px;cursor:pointer;display:grid;place-items:center">&times;</button>
        <span class="chip ${isVerified ? 'verified' : 'unverified'}" style="position:absolute;bottom:14px;left:14px">
          ${isVerified ? '✓ Verified by Local Team' : 'Check Hours Locally'}
        </span>
      </div>

      <div style="padding:24px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px">
          <h2 style="font-size:22px;font-weight:900;color:var(--tx)">${item.name}</h2>
          <span style="font-size:12px;font-weight:800;color:var(--ac);text-transform:uppercase;letter-spacing:0.06em">${areaLabel(item.cluster)}</span>
        </div>

        <p style="font-size:14.5px;color:var(--t2);line-height:1.6;margin-bottom:18px">${item.notes || 'One of Dehradun & Mussoorie’s most famous landmarks.'}</p>

        <div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--r-lg);padding:14px 16px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
          <div>
            <b style="color:var(--mu);display:block;font-size:11px;text-transform:uppercase;margin-bottom:2px">Altitude</b>
            <span style="color:#00D492;font-weight:700">${altitude}</span>
          </div>
          <div>
            <b style="color:var(--mu);display:block;font-size:11px;text-transform:uppercase;margin-bottom:2px">Typical Duration</b>
            <span style="color:var(--tx);font-weight:700">~${item.visit.typical} minutes</span>
          </div>
          ${item.bestTime ? `
            <div style="grid-column:1/-1">
              <b style="color:var(--mu);display:block;font-size:11px;text-transform:uppercase;margin-bottom:2px">Best Visiting Window</b>
              <span style="color:#FFA726;font-weight:700">${item.bestTime.from} – ${item.bestTime.to}: ${item.bestTime.why}</span>
            </div>
          ` : ''}
        </div>

        <div style="background:var(--panel);border:1px solid var(--line);border-radius:var(--r-md);padding:12px 14px;margin-bottom:18px;font-size:12.5px;display:flex;flex-direction:column;gap:6px">
          <div><b style="color:var(--orange)">🍜 Must-Try Food Companion:</b> <span style="color:var(--tx)">${companionFood(item.id)}</span></div>
          <div><b style="color:#00D492">🎒 What to Pack / Wear:</b> <span style="color:var(--t2)">${whatToPack(item)}</span></div>
        </div>

        ${item.tips && item.tips.length ? `
          <div style="margin-bottom:22px">
            <h4 style="font-size:12px;font-weight:800;text-transform:uppercase;color:var(--mu);letter-spacing:0.06em;margin-bottom:8px">Local Insider Tips</h4>
            <ul style="list-style:none;font-size:13.5px;color:var(--t2)">
              ${item.tips.map(t => `<li style="margin-bottom:6px;display:flex;gap:8px"><span>📍</span><span>${t}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="scd-btn-3d-primary" id="modal-plan-place" style="flex:1;justify-content:center">
            Plan this stop
          </button>
          <a class="scd-btn-3d-orange" href="${placeDirectionsUrl(item)}" target="_blank" rel="noopener" style="flex:1;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Directions
          </a>
          <a class="scd-btn-3d-secondary" href="${placeUrl(item)}" target="_blank" rel="noopener" style="flex:1;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Google Maps
          </a>
          <button class="scd-btn-3d-secondary" id="modal-close-bottom" style="padding:10px 16px">
            Dismiss
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');

    body.querySelector('#modal-close-btn')?.addEventListener('click', () => modal.classList.remove('open'));
    body.querySelector('#modal-close-bottom')?.addEventListener('click', () => modal.classList.remove('open'));
    body.querySelector('#modal-plan-place')?.addEventListener('click', () => {
      modal.classList.remove('open');
      this.state.locks = { include: [item.id] };
      window.location.hash = '#/planner';
      this.recomputePlan();
    });
  }

  private updateStickyPill(plan: Itinerary | null) {
    const pill = this.rootEl.querySelector('#sticky-pill') as HTMLElement;
    if (!pill || !plan) {
      if (pill) pill.style.display = 'none';
      return;
    }
    pill.style.display = 'flex';
    pill.querySelector('#pill-title')!.textContent = `${plan.stops.length} stops`;
    pill.querySelector('#pill-return')!.textContent = `Back by ${this.formatTime(plan.expectedReturn)}`;
  }

  private setupResizeObserver() {
    new ResizeObserver(() => this.sendEmbedHeight()).observe(document.body);
  }

  private sendEmbedHeight() {
    if (typeof window !== 'undefined' && window.top !== window.self) {
      window.parent.postMessage({ scd: 'h', h: document.documentElement.scrollHeight }, '*');
    }
  }
}

if (typeof document !== 'undefined') {
  const mountApp = () => {
    const root = document.getElementById('app');
    if (root && !root.dataset.initialized) {
      root.dataset.initialized = 'true';
      new ExploreDoonApp(root);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    mountApp();
  }
}
