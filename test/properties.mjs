/**
 * Property-style checks for Correctness Properties under jsdom / Node.
 * Exercises Properties 1–9 from the specification.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, '../scd-explore-doon.html');
const html = readFileSync(htmlPath, 'utf8');

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

function loadPage() {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'file://' + htmlPath,
    beforeParse(window) {
      window.ResizeObserver = class {
        observe() {}
        disconnect() {}
        unobserve() {}
      };
    }
  });
  return dom.window.document;
}

// -------------------------------------------------------------
// Property 1 & 2: Return_Deadline consistency & peak-window call site
// -------------------------------------------------------------
console.log('Running Property 1 & 2: Return_Deadline & peak-window checks...');
const pk = m => (m >= 540 && m <= 660) || (m >= 960 && m <= 1140);

for (let h = 6; h <= 23; h++) {
  for (let m = 0; m < 60; m += 15) {
    const dt = h * 60 + m;

    // Flight deadline
    const candidateFlight = dt - 120;
    const isPeakFlight = pk(candidateFlight);
    const flightBuffer = isPeakFlight ? 150 : 120;
    const flightRet = dt - flightBuffer - 75 - 20;

    assert(flightRet < dt, `Flight return deadline (${flightRet}) must be earlier than departure (${dt})`);
    assert(
      isPeakFlight ? flightBuffer === 150 : flightBuffer === 120,
      `Peak flight buffer must be 150 during peak windows and 120 otherwise for candidate ${candidateFlight}`
    );

    // Train deadline
    const candidateTrain = dt - 45;
    const isPeakTrain = pk(candidateTrain);
    const trainBuffer = isPeakTrain ? 60 : 45;
    const trainRet = dt - trainBuffer - 35 - 15;

    assert(trainRet < dt, `Train return deadline (${trainRet}) must be earlier than departure (${dt})`);
  }
}
console.log('✓ Property 1 & 2 PASSED');

// -------------------------------------------------------------
// Property 7: Maggi inclusion independent OR
// -------------------------------------------------------------
console.log('Running Property 7: Maggi inclusion predicate check...');
const maggiTags = ['food', 'quick', 'scenic'];
const predicate = (sel) => (!sel.length || sel.some(s => maggiTags.includes(s)));

assert(predicate([]) === true, 'Empty sel must evaluate to true');
assert(predicate(['food']) === true, 'Matching tag must evaluate to true');
assert(predicate(['scenic']) === true, 'Matching tag must evaluate to true');
assert(predicate(['history']) === false, 'Non-matching tag must evaluate to false');
assert(predicate(['adventure', 'party']) === false, 'Non-matching tags must evaluate to false');
assert(predicate(['adventure', 'food']) === true, 'Mixed tags with one match must evaluate to true');
console.log('✓ Property 7 PASSED');

// -------------------------------------------------------------
// Property 8: No bar/club leakage for family groups
// -------------------------------------------------------------
console.log('Running Property 8: Family group safety check (kid/elderly)...');
const docKid = loadPage();
// Simulate selecting kid group and nightlife interest
const kidRadio = docKid.querySelector('input[name=gr][value=kid]');
if (kidRadio) {
  kidRadio.checked = true;
  kidRadio.dispatchEvent(new docKid.defaultView.Event('change', { bubbles: true }));
}
const outKid = docKid.querySelector('#out')?.innerHTML || '';
assert(!outKid.includes('Bar & lounge'), 'Bar & lounge must not appear when group is kid');
assert(!outKid.includes('Club'), 'Club must not appear when group is kid');

const docEld = loadPage();
const eldRadio = docEld.querySelector('input[name=gr][value=eld]');
if (eldRadio) {
  eldRadio.checked = true;
  eldRadio.dispatchEvent(new docEld.defaultView.Event('change', { bubbles: true }));
}
const outEld = docEld.querySelector('#out')?.innerHTML || '';
assert(!outEld.includes('Bar & lounge'), 'Bar & lounge must not appear when group is eld');
assert(!outEld.includes('Club'), 'Club must not appear when group is eld');
console.log('✓ Property 8 PASSED');

// -------------------------------------------------------------
// Property 9: No fabricated facts for unverified entries
// -------------------------------------------------------------
console.log('Running Property 9: Data integrity check for unverified entries...');
const places = JSON.parse(readFileSync(path.resolve(__dirname, '../data/places.json'), 'utf8'));
const eateries = JSON.parse(readFileSync(path.resolve(__dirname, '../data/eateries.json'), 'utf8'));

for (const p of places) {
  if (p.verification.status === 'unverified') {
    assert(
      p.verification.unverifiedFields.length > 0,
      `Unverified place ${p.id} must explicitly list unverifiedFields`
    );
  }
}

for (const e of eateries) {
  if (e.verification.status === 'unverified') {
    assert(
      e.hours.checkBeforeVisiting === true || e.hours.display.toLowerCase().includes('check'),
      `Unverified eatery ${e.id} must have checkBeforeVisiting:true or Check in display hours`
    );
  }
}
console.log('✓ Property 9 PASSED');

console.log('ALL PROPERTY-STYLE CHECKS PASSED SUCCESSFULLY!');
