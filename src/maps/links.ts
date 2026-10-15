import type { Place, TransportMode } from '../engine/types.ts';

const CAMPUS_NAME = 'Graphic Era Deemed to be University, Clement Town, Dehradun, Uttarakhand';
const CAMPUS_COORDS = '30.2705,77.9965';

export function placeUrl(place: Place): string {
  if (place.coords && place.coords.lat && place.coords.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${place.coords.lat},${place.coords.lng}`;
  }
  const queryStr = `${place.name}, ${place.cluster.replace('-', ' ')}, Dehradun, Uttarakhand`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
}

export interface DirectionsParams {
  origin?: string; // name or lat,lng
  destination?: string;
  waypoints?: string[]; // array of names or lat,lng
  mode?: TransportMode;
}

export function dirUrl(params: DirectionsParams): string {
  const origin = encodeURIComponent(params.origin || CAMPUS_COORDS);
  const destination = encodeURIComponent(params.destination || CAMPUS_COORDS);

  let travelmode = 'driving';
  if (params.mode === 'bike') travelmode = 'two-wheeler';
  else if (params.mode === 'walk') travelmode = 'walking';
  else if (params.mode === 'public') travelmode = 'transit';

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelmode}`;

  if (params.waypoints && params.waypoints.length > 0) {
    // Google Maps dir URL supports pipe-delimited waypoints (up to ~9-10 waypoints)
    const waypointsStr = params.waypoints
      .slice(0, 9)
      .map(wp => encodeURIComponent(wp))
      .join('|');
    url += `&waypoints=${waypointsStr}`;
  }

  return url;
}

export function fullRouteUrl(stops: Place[], mode: TransportMode): string {
  if (!stops.length) {
    return dirUrl({ origin: CAMPUS_COORDS, destination: CAMPUS_COORDS, mode });
  }

  const waypoints = stops.map(s => {
    if (s.coords && s.coords.lat && s.coords.lng) {
      return `${s.coords.lat},${s.coords.lng}`;
    }
    return `${s.name}, Uttarakhand`;
  });

  return dirUrl({
    origin: CAMPUS_COORDS,
    destination: CAMPUS_COORDS,
    waypoints,
    mode
  });
}
