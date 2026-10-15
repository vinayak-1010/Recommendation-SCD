import { placeUrl, dirUrl, fullRouteUrl } from '../src/maps/links.ts';
import type { Place } from '../src/engine/types.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

console.log('--- TESTING MAPS LINKS (LAYER 1) ---');

const dummyPlaceWithCoords: Place = {
  id: 'mind',
  name: 'Mindrolling Monastery',
  kind: 'attraction',
  coords: { lat: 30.2625, lng: 78.0062, source: 'osm' },
  cluster: 'clement-town',
  experienceType: 'monastery',
  affinity: {},
  role: 'primary',
  visit: { min: 30, typical: 60, max: 90 },
  parkingWalk: { car: 5, bike: 2 },
  hours: null,
  suitability: { car: 1, bike: 1, public: 1, kids: true, elders: true, strenuous: false },
  notes: '',
  verification: { status: 'verified' }
};

const dummyPlaceNoCoords: Place = {
  id: 'koi',
  name: 'Koi',
  kind: 'cafe',
  coords: null,
  cluster: 'rajpur',
  experienceType: 'cafe-city',
  affinity: {},
  role: 'optional',
  visit: { min: 30, typical: 45, max: 60 },
  parkingWalk: { car: 5, bike: 2 },
  hours: null,
  suitability: { car: 1, bike: 1, public: 1, kids: true, elders: true, strenuous: false },
  notes: '',
  verification: { status: 'unknown' }
};

// 1. placeUrl tests
const urlWithCoords = placeUrl(dummyPlaceWithCoords);
assert(urlWithCoords.includes('30.2625,78.0062'), 'Coords link must contain lat/lng');

const urlNoCoords = placeUrl(dummyPlaceNoCoords);
assert(urlNoCoords.includes('query=Koi'), 'Fallback link must encode venue name');
console.log('placeUrl: OK');

// 2. dirUrl tests
const singleDir = dirUrl({
  origin: '30.2705,77.9965',
  destination: '30.4635,78.0988',
  mode: 'bike'
});
assert(singleDir.includes('travelmode=two-wheeler'), 'Bike mode should use travelmode=two-wheeler');
assert(singleDir.includes('destination=30.4635%2C78.0988'), 'Destination should be encoded');
console.log('dirUrl: OK');

// 3. fullRouteUrl tests
const routeLink = fullRouteUrl([dummyPlaceWithCoords, dummyPlaceNoCoords], 'car');
assert(routeLink.includes('waypoints='), 'Full route link must contain waypoints');
assert(routeLink.includes('travelmode=driving'), 'Car mode uses driving');
console.log('fullRouteUrl: OK — well-formed multi-stop Google Maps URL');

console.log('ALL MAPS LINK TESTS PASSED!');
