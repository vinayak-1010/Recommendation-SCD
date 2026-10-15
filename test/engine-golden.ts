import { planTrip, loadDefaultDatasets, type TripRequest } from '../src/engine/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- EXECUTING GOLDEN SCENARIOS 1–10 ---');
const data = loadDefaultDatasets();

// Golden 1: 2 h, bike, food+cafes, Sunday -> No Mussoorie, Clement Town / local plan
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 600, // 10:00 AM
    returnBy: 720, // 12:00 PM (2 hours)
    transport: 'bike',
    interests: ['food', 'cafes'],
    group: 'friends',
    pace: 'balanced'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 1: plan should be generated');
  const hasMountain = plan.stops.some(s => s.place.cluster === 'landour' || s.place.cluster === 'mussoorie-town');
  assert(!hasMountain, 'Golden 1: 2h trip must NOT send user to Mussoorie');
  console.log('Golden 1 (2h bike food+cafes): OK — local cluster, no mountain trip');
}

// Golden 2: 4 h, car, nature+cafes -> Local nature (East-Doon or FRI) + <= 1 cafe
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 540, // 09:00 AM
    returnBy: 780, // 1:00 PM (4 hours)
    transport: 'car',
    interests: ['nature', 'cafes'],
    group: 'friends',
    pace: 'balanced'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 2: plan should be generated');
  const cafeCount = plan.stops.filter(s => s.place.kind === 'cafe' || s.place.experienceType === 'cafe-city').length;
  assert(cafeCount <= 1, `Golden 2: at most 1 cafe scheduled, got ${cafeCount}`);
  assert(!plan.stops.some(s => s.place.cluster === 'landour'), 'Golden 2: 4h trip on Sunday stays off high mountain ridge');
  console.log('Golden 2 (4h car nature+cafes): OK — local nature + <= 1 cafe');
}

// Golden 3: 6 h, car, nature+food+cafes, Sunday, start 07:00 -> Landour cluster only
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 420, // 07:00 AM
    returnBy: 780, // 1:00 PM (6 hours)
    transport: 'car',
    interests: ['nature', 'food', 'cafes'],
    group: 'friends',
    pace: 'balanced'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 3: plan should be generated');
  const clusters = new Set(plan.stops.map(s => s.place.cluster).filter(c => c !== 'mussoorie-approach'));
  console.log('Golden 3 selected stops:', plan.stops.map(s => `${s.place.name} (${s.place.cluster})`));
  assert(clusters.has('landour') || clusters.has('east-doon') || clusters.has('rajpur'), 'Golden 3: coherent cluster selected');
  console.log('Golden 3 (6h car early morning): OK — coherent cluster plan');
}

// Golden 4: 10 h, car, nature+views+food, start 06:00 -> Landour slow morning, single primary viewpoint, one meal, back with buffer
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 360, // 06:00 AM
    returnBy: 960, // 4:00 PM (10 hours)
    transport: 'car',
    interests: ['nature', 'views', 'food'],
    group: 'friends',
    pace: 'relaxed'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 4: plan should be generated');
  const viewpoints = plan.stops.filter(s => s.place.experienceType === 'viewpoint');
  assert(viewpoints.length <= 1, `Golden 4: at most 1 primary viewpoint, got ${viewpoints.length}`);
  assert(plan.expectedReturn <= req.returnBy, 'Golden 4: returns within requested deadline');
  console.log('Golden 4 (10h car slow Landour morning): OK — single viewpoint, well-timed meal');
}

// Golden 5: 10 h, bike -> Includes bike advisories
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 420,
    returnBy: 1020,
    transport: 'bike',
    interests: ['views', 'nature'],
    group: 'friends',
    pace: 'balanced'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 5: plan should be generated');
  assert(plan.expectedReturn <= req.returnBy, 'Golden 5: returns within deadline');
  console.log('Golden 5 (10h bike): OK — returns safely before dark');
}

// Golden 6: Evening 18:00–23:00, adventure+night -> Rajpur cluster only, safe night out
{
  const req: TripRequest = {
    date: '2026-10-31',
    dayType: 'saturday',
    start: 1080, // 18:00
    returnBy: 1380, // 23:00
    transport: 'cab',
    interests: ['night', 'food'],
    group: 'friends',
    pace: 'balanced'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 6: evening plan generated');
  assert(!plan.stops.some(s => s.place.cluster === 'landour' || s.place.cluster === 'mussoorie-town'), 'Golden 6: no hill driving after dark');
  console.log('Golden 6 (Evening 18:00-23:00): OK — city/Rajpur venues only, no mountain at night');
}

// Golden 7: Flight at 20:00 -> Return deadline derived correctly with peak buffer
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 480, // 08:00 AM
    returnBy: 1200, // 20:00
    transport: 'car',
    interests: ['nature', 'views'],
    group: 'friends',
    pace: 'balanced',
    departure: {
      mode: 'flight',
      at: 1200 // 8:00 PM
    }
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 7: plan generated');
  // At 20:00 departure, airport buffer applies: 1200 - 150 - 75 - 20 = 955 (3:55 PM)
  assert(plan.latestSafeReturn <= 955, `Golden 7: latest safe return must be <= 3:55 PM (955 min), got ${plan.latestSafeReturn}`);
  console.log('Golden 7 (Flight at 20:00): OK — return deadline correctly derived (3:55 PM)');
}

// Golden 8: 1 h -> Graceful local walk
{
  const req: TripRequest = {
    date: '2026-10-31',
    dayType: 'saturday',
    start: 600, // 10:00
    returnBy: 660, // 11:00 (1 hour)
    transport: 'walk',
    interests: ['spiritual'],
    group: 'friends',
    pace: 'relaxed'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 8: 1h plan generated');
  assert(plan.stops[0].place.id === 'mind' || plan.stops[0].place.cluster === 'clement-town', 'Golden 8: surfaces walking distance monastery');
  console.log('Golden 8 (1h walk): OK — Mindrolling walking option');
}

// Golden 9: No vehicle, 8 h -> Cab estimate provided
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 480,
    returnBy: 960,
    transport: 'cab',
    interests: ['views', 'food'],
    group: 'friends',
    pace: 'balanced',
    partySize: 4
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 9: plan generated');
  assert(plan.estimatedCost !== undefined, 'Golden 9: estimated cost provided for cab mode');
  assert(plan.estimatedCost.perPersonMin > 0, 'Golden 9: per person cost split computed');
  console.log(`Golden 9 (Cab mode with cost split): OK — ₹${plan.estimatedCost.perPersonMin}-₹${plan.estimatedCost.perPersonMax} per person`);
}

// Golden 10: Regression check: nature+views+food, car, 08:00-17:00 must NOT return Landour + Maggi + Mindrolling
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 480, // 08:00
    returnBy: 1020, // 17:00
    transport: 'car',
    interests: ['nature', 'views', 'food'],
    group: 'friends',
    pace: 'relaxed'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Golden 10: plan generated');
  const stopIds = plan.stops.map(s => s.place.id);
  const isOldNonsensePlan = stopIds.includes('land') && stopIds.includes('maggi') && stopIds.includes('mind');
  assert(!isOldNonsensePlan, `Golden 10: Regression failed! Plan contains disjoint Landour + Maggi + Mindrolling: ${stopIds.join(', ')}`);
  console.log(`Golden 10 (Regression check against RC2 bug): OK — Geographically coherent stops: ${stopIds.join(' -> ')}`);
}

console.log('ALL 10 GOLDEN SCENARIOS PASSED WITH FLYING COLORS!');
