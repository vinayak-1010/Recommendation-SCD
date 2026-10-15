import { planTrip, loadDefaultDatasets, ReplanEngine, type TripRequest } from '../src/engine/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- TESTING REPLAN ENGINE (§8.7, §10) ---');
const data = loadDefaultDatasets();
const replanEngine = new ReplanEngine(data);

const req: TripRequest = {
  date: '2026-11-01',
  dayType: 'sunday',
  start: 480, // 08:00
  returnBy: 1020, // 17:00
  transport: 'car',
  interests: ['views', 'food'],
  group: 'friends',
  pace: 'relaxed'
};

const initialPlan = planTrip(req, data);
assert(initialPlan !== null, 'Initial plan must generate');

const swappableStop = initialPlan.stops.find(s => s.alternatives && s.alternatives.length > 0);
assert(swappableStop !== undefined, 'Plan must contain at least one stop with alternatives');

console.log(`Original stop: ${swappableStop.place.name}`);
const alt = swappableStop.alternatives![0];
console.log(`Swapping with: ${alt.place.name}`);

// 1. Valid swap
const swapResult = replanEngine.replan(initialPlan, req, {
  type: 'swap',
  stopId: swappableStop.place.id,
  altId: alt.place.id
});

assert(swapResult.success, `Swap should succeed: ${swapResult.rejectionReason}`);
assert(swapResult.itinerary !== undefined, 'New itinerary should be returned');
assert(swapResult.itinerary.stops.some(s => s.place.id === alt.place.id), 'New stop must be present');
console.log('Valid swap: OK — timeline updated and recomputed');

// 2. Reject infeasible swap
const tightReq: TripRequest = {
  date: '2026-11-01',
  dayType: 'sunday',
  start: 480, // 08:00
  returnBy: 660, // 11:00 (tight 3 hours)
  transport: 'car',
  interests: ['spiritual'],
  group: 'friends',
  pace: 'relaxed'
};
const tightPlan = planTrip(tightReq, data);
assert(tightPlan !== null, 'Tight plan should generate');

// Attempt swapping a quick local stop for an 11km Bhadraj mountain trek!
const badSwap = replanEngine.replan(tightPlan, tightReq, {
  type: 'swap',
  stopId: tightPlan.stops[0].place.id,
  altId: 'bha' // 11 km trek
});

assert(!badSwap.success, 'Infeasible swap must be rejected');
assert(badSwap.rejectionReason !== undefined && badSwap.rejectionReason.length > 0, 'Rejection reason must be provided');
console.log(`Infeasible swap rejection: OK — "${badSwap.rejectionReason}"`);

// 3. Shift start time
const shiftResult = replanEngine.replan(initialPlan, req, {
  type: 'shiftStart',
  minutes: 60
});
assert(shiftResult.success, 'Shift start must succeed');
assert(shiftResult.itinerary !== undefined, 'Shifted itinerary returned');
console.log('Shift start: OK');

console.log('ALL REPLAN TESTS PASSED!');
