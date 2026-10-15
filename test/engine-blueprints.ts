import { planTrip, loadDefaultDatasets, type TripRequest } from '../src/engine/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- TESTING MUSSOORIE BLUEPRINTS DISCOVERY (§6.2) ---');
const data = loadDefaultDatasets();

// Blueprint 1: Landour Slow Morning (8–10 h, start 06:00, views, food)
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 360, // 06:00
    returnBy: 900, // 15:00 (9 hours)
    transport: 'car',
    interests: ['views', 'food', 'nature'],
    group: 'friends',
    pace: 'relaxed'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Blueprint 1: plan generated');
  const stopNames = plan.stops.map(s => s.place.name);
  console.log('Blueprint 1 (Landour Slow Morning):', stopNames);
  assert(stopNames.some(n => n.includes('Landour') || n.includes('Lal Tibba')), 'Blueprint 1: includes Lal Tibba / Landour');
  assert(stopNames.some(n => n.includes('Char Dukan') || n.includes('Bakehouse')), 'Blueprint 1: includes Char Dukan or Bakehouse breakfast');
}

// Blueprint 4: Doon Nature Half-Day (4–5 h, east-doon nature)
{
  const req: TripRequest = {
    date: '2026-11-01',
    dayType: 'sunday',
    start: 540, // 09:00
    returnBy: 810, // 13:30 (4.5 hours)
    transport: 'car',
    interests: ['nature', 'adventure'],
    group: 'friends',
    pace: 'balanced'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Blueprint 4: plan generated');
  const stopNames = plan.stops.map(s => s.place.name);
  console.log('Blueprint 4 (Doon Nature Half-Day):', stopNames);
  assert(stopNames.some(n => n.includes('Robber') || n.includes('Sahastradhara')), 'Blueprint 4: includes Robbers Cave or Sahastradhara');
}

// Blueprint 5: Culture & Cafés (3–4 h, clement town)
{
  const req: TripRequest = {
    date: '2026-10-31',
    dayType: 'saturday',
    start: 600, // 10:00
    returnBy: 810, // 13:30 (3.5 hours)
    transport: 'walk',
    interests: ['spiritual', 'heritage'],
    group: 'friends',
    pace: 'relaxed'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Blueprint 5: plan generated');
  const stopNames = plan.stops.map(s => s.place.name);
  console.log('Blueprint 5 (Culture & Cafés):', stopNames);
  assert(stopNames.some(n => n.includes('Mindrolling') || n.includes('Tibetan')), 'Blueprint 5: includes Mindrolling / Tibetan area');
}

// Blueprint 6: Cafés & Night (evening, no hills)
{
  const req: TripRequest = {
    date: '2026-10-31',
    dayType: 'saturday',
    start: 1110, // 18:30
    returnBy: 1380, // 23:00
    transport: 'cab',
    interests: ['night', 'food'],
    group: 'friends',
    pace: 'balanced'
  };

  const plan = planTrip(req, data);
  assert(plan !== null, 'Blueprint 6: plan generated');
  const stopNames = plan.stops.map(s => s.place.name);
  console.log('Blueprint 6 (Cafes & Night):', stopNames);
  assert(!plan.stops.some(s => s.place.cluster === 'landour' || s.place.cluster === 'mussoorie-town'), 'Blueprint 6: hills excluded at night');
}

console.log('ALL BLUEPRINT TESTS PASSED!');
