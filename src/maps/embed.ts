import type { Place, TransportMode } from '../engine/types.ts';

export interface EmbedMapOptions {
  places: Place[];
  transport: TransportMode;
  apiKey?: string;
}

/**
 * Layer 2: Google Maps Embed API Generator.
 * Used on-demand when an API key is configured.
 */
export function buildEmbedUrl(options: EmbedMapOptions): string | null {
  const key = options.apiKey || (typeof window !== 'undefined' ? (window as any).__GOOGLE_MAPS_KEY : undefined);
  if (!key || options.places.length === 0) return null;

  const mode = options.transport === 'walk' ? 'walking' : (options.transport === 'bike' ? 'bicycling' : 'driving');
  const origin = `${options.places[0].coords.lat},${options.places[0].coords.lng}`;
  const dest = `${options.places[options.places.length - 1].coords.lat},${options.places[options.places.length - 1].coords.lng}`;

  let url = `https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(key)}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&mode=${mode}`;

  if (options.places.length > 2) {
    const waypoints = options.places
      .slice(1, -1)
      .map(p => `${p.coords.lat},${p.coords.lng}`)
      .join('|');
    url += `&waypoints=${encodeURIComponent(waypoints)}`;
  }

  return url;
}
