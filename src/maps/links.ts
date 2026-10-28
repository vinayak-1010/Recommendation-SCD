import type { Place, TransportMode } from '../engine/types.ts';

const CAMPUS_NAME = 'Graphic Era Deemed to be University, Clement Town, Dehradun, Uttarakhand';
const CAMPUS_COORDS = '30.2705,77.9965';

export function placeUrl(place: Place): string {
  const locationTag = ['landour', 'mussoorie-town', 'mussoorie-approach', 'mussoorie-outskirts', 'park-estate'].includes(place.cluster)
    ? 'Mussoorie, Uttarakhand'
    : place.cluster === 'rishikesh'
      ? 'Rishikesh, Uttarakhand'
      : place.cluster === 'dhanaulti'
        ? 'Dhanaulti, Uttarakhand'
        : 'Dehradun, Uttarakhand';

  const queryStr = `${place.name}, ${locationTag}`;
  if (place.coords && place.coords.lat && place.coords.lng) {
    // Both query name AND coords for guaranteed official POI match and position
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}&ll=${place.coords.lat},${place.coords.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
}

export function placeDirectionsUrl(place: Place, mode: TransportMode = 'car'): string {
  let travelmode = 'driving';
  if (mode === 'bike') travelmode = 'two-wheeler';
  else if (mode === 'walk') travelmode = 'walking';
  else if (mode === 'public') travelmode = 'transit';

  if (place.coords && place.coords.lat && place.coords.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.coords.lat},${place.coords.lng}&travelmode=${travelmode}`;
  }
  const locationTag = ['landour', 'mussoorie-town', 'mussoorie-approach', 'mussoorie-outskirts', 'park-estate'].includes(place.cluster)
    ? 'Mussoorie, Uttarakhand'
    : 'Dehradun, Uttarakhand';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ', ' + locationTag)}&travelmode=${travelmode}`;
}

export interface DirectionsParams {
  origin?: string; // name or lat,lng
  destination?: string;
  waypoints?: string[]; // array of names or lat,lng
  mode?: TransportMode;
}

export function dirUrl(params: DirectionsParams): string {
  let travelmode = 'driving';
  if (params.mode === 'bike') travelmode = 'two-wheeler';
  else if (params.mode === 'walk') travelmode = 'walking';
  else if (params.mode === 'public') travelmode = 'transit';

  const query = new URLSearchParams({
    api: '1',
    origin: params.origin || CAMPUS_COORDS,
    destination: params.destination || CAMPUS_COORDS,
    travelmode
  });
  if (params.waypoints?.length) {
    // Encode each route component once; Maps expects pipe-delimited waypoint entries.
    query.set('waypoints', params.waypoints.slice(0, 9).join('|'));
  }
  return `https://www.google.com/maps/dir/?${query.toString()}`;
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
