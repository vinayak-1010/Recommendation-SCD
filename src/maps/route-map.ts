import type { Place, Itinerary } from '../engine/types.ts';
import { buildEmbedUrl } from './embed.ts';

interface Coords {
  lat: number;
  lng: number;
}

const BOUNDS = {
  minLat: 30.24,
  maxLat: 30.48,
  minLng: 77.96,
  maxLng: 78.13
};

const CAMPUS_ORIGIN: Place = {
  id: 'campus',
  name: 'Graphic Era (Campus)',
  cluster: 'clement-town',
  coords: { lat: 30.2705, lng: 77.9965 },
  timing: { open: '00:00', close: '23:59', bestTime: 'any' },
  visit: { min: 0, typical: 0, max: 0 },
  affinities: { nature: 0, culture: 0, food: 0, adventure: 0, views: 0, photography: 0, quiet: 0, shopping: 0 },
  suitability: { mode: ['car', 'bike', 'walk'], groups: ['solo', 'friends', 'couple', 'family-kids', 'family-elders'], pace: ['relaxed', 'moderate', 'packed'] },
  cost: { tier: 'free', perPersonEst: 0 },
  logistics: { parking: 'easy', mountainRoad: false, daylightSensitive: false, crowdP80: 'moderate' },
  verification: { status: 'verified', lastAudit: '2026-10-14', unverifiedFields: [] },
  editorial: { oneLiner: 'AWS SCD 2026 Venue', whatToExpect: [], photoTips: '', insiderSecret: '', warnings: [] }
};

function project(coords: Coords, width = 480, height = 480, padding = 40): { x: number; y: number } {
  const normX = (coords.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);
  // Lat increases northward, so invert Y
  const normY = (BOUNDS.maxLat - coords.lat) / (BOUNDS.maxLat - BOUNDS.minLat);

  return {
    x: padding + normX * (width - 2 * padding),
    y: padding + normY * (height - 2 * padding)
  };
}

export function renderRouteMap(itinerary: Itinerary): string {
  const stops = itinerary.stops.map(s => s.place);
  const routePlaces = [CAMPUS_ORIGIN, ...stops, CAMPUS_ORIGIN];
  const points = routePlaces.map(p => project(p.coords));

  // Build SVG path
  const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

  // Foothill contour lines (~ Rajpur/Toll latitude: 30.38)
  const ridgeY = project({ lat: 30.38, lng: 78.04 }).y;

  return `
    <div class="route-map-container" style="position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--r-card);overflow:hidden;margin-bottom:20px">
      <div style="padding:14px 16px 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--ac)">Interactive Route Map</span>
          <span style="font-size:11px;color:var(--mu)">· Keyless & Offline</span>
        </div>
        <span class="mono" style="font-size:11px;color:var(--t2)">${itinerary.stops.length} stops · zero backtracking</span>
      </div>

      <svg viewBox="0 0 480 480" style="width:100%;height:auto;display:block;background:radial-gradient(ellipse at 50% 10%, rgba(173,92,255,0.08) 0%, transparent 70%), var(--bg);" aria-label="Route map diagram">
        <!-- Mountain Foothills Boundary -->
        <line x1="20" y1="${ridgeY.toFixed(1)}" x2="460" y2="${ridgeY.toFixed(1)}" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 4" />
        <text x="30" y="${(ridgeY - 8).toFixed(1)}" fill="rgba(255,255,255,0.3)" font-size="10" font-weight="700" letter-spacing="1">MUSSOORIE & LANDOUR RIDGE (2,000m+)</text>
        <text x="30" y="${(ridgeY + 16).toFixed(1)}" fill="rgba(255,255,255,0.3)" font-size="10" font-weight="700" letter-spacing="1">DOON VALLEY (650m)</text>

        <!-- Route Path Halo -->
        <path d="${pathD}" fill="none" stroke="#AD5CFF" stroke-width="6" stroke-opacity="0.2" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Route Path Line -->
        <path d="${pathD}" fill="none" stroke="#AD5CFF" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Waypoint Nodes -->
        ${points.map((pt, i) => {
          const isOrigin = i === 0 || i === points.length - 1;
          const place = routePlaces[i];
          if (i === points.length - 1) return ''; // Skip duplicate return origin

          if (isOrigin) {
            return `
              <g transform="translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})">
                <circle r="10" fill="#AD5CFF" fill-opacity="0.3"/>
                <circle r="6" fill="#AD5CFF"/>
                <text x="14" y="4" fill="#FFFFFF" font-size="11" font-weight="700" font-family="'Plus Jakarta Sans',sans-serif">Graphic Era (Start/End)</text>
              </g>
            `;
          }

          const stopIndex = i; // 1-based stop index
          return `
            <g transform="translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})" style="cursor:pointer">
              <circle r="14" fill="#0A0C13" stroke="#AD5CFF" stroke-width="2"/>
              <text x="0" y="4" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="800" font-family="'JetBrains Mono',monospace">${stopIndex}</text>
              <text x="18" y="4" fill="var(--tx, #F1F5F9)" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans',sans-serif">${place.name.split(' (')[0]}</text>
            </g>
          `;
        }).join('')}
      </svg>
    </div>
  `;
}
