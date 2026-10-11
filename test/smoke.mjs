// Minimal, dependency-light smoke-test harness for scd-explore-doon.html.
//
// Run manually with: node test/smoke.mjs
// Not wired into any CI (the project has none) — see design.md's Testing Strategy.
//
// Loads the page into a jsdom JSDOM instance with the inline <script> executing
// (runScripts:'dangerously'), then exposes small helpers to dispatch synthetic
// `change` events on the control-panel inputs (#st, #dm, #dt, and the radio/
// checkbox groups rendered inside #g-tr/#g-gr/#g-pc/#g-in) and read back the
// rendered #out.innerHTML. Golden-test assertions (tasks 8-9) extend this file.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'scd-explore-doon.html');
const html = readFileSync(htmlPath, 'utf8');

/**
 * Loads scd-explore-doon.html into a fresh jsdom instance and lets its inline
 * script execute (including the initial `run()` call at the bottom of the IIFE).
 *
 * `resources:'usable'` is intentionally NOT set: the page's only <script> is
 * inline (no external <script src>), so jsdom doesn't need to fetch anything
 * to execute it. Leaving resource fetching off keeps the harness fast and
 * network-independent (no dependency on the Google Fonts / image requests
 * the page would otherwise attempt).
 *
 * jsdom has no ResizeObserver implementation, but the page's script does
 * `new ResizeObserver(send).observe(document.body)` right before calling
 * `run()`. Without a polyfill that throws a ReferenceError and `run()` never
 * executes, so a no-op polyfill is installed via `beforeParse`.
 */
export function loadPage() {
  const errors = [];
  const dom = new JSDOM(html, {
    url: 'http://localhost/scd-explore-doon.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    },
  });

  dom.window.addEventListener('error', (e) => {
    errors.push(e.error || e.message || e);
  });
  dom.virtualConsole.on('jsdomError', (err) => {
    errors.push(err);
  });

  return { dom, window: dom.window, document: dom.window.document, errors };
}

function fireChange(el) {
  const Event = el.ownerDocument.defaultView.Event;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Sets a direct input's value (e.g. #st, #dm, #dt) and dispatches `change`. */
export function setValue(document, selector, value) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`No element matching ${selector}`);
  el.value = value;
  fireChange(el);
  return el;
}

/** Checks the radio with the given value inside a group container (#g-tr/#g-gr/#g-pc) and dispatches `change`. */
export function selectRadio(document, containerSelector, value) {
  const input = document.querySelector(`${containerSelector} input[value="${value}"]`);
  if (!input) throw new Error(`No radio with value "${value}" inside ${containerSelector}`);
  input.checked = true;
  fireChange(input);
  return input;
}

/** Toggles the checkbox with the given value inside a group container (#g-in) and dispatches `change`. */
export function toggleCheckbox(document, containerSelector, value) {
  const input = document.querySelector(`${containerSelector} input[value="${value}"]`);
  if (!input) throw new Error(`No checkbox with value "${value}" inside ${containerSelector}`);
  input.checked = !input.checked;
  fireChange(input);
  return input;
}

/** Reads back the rendered output panel's innerHTML. */
export function getOutHTML(document) {
  const out = document.querySelector('#out');
  if (!out) throw new Error('#out element not found');
  return out.innerHTML;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

/** Slices out the nearest `<article>...</article>` block containing `marker` from a rendered HTML string. */
function extractCard(renderedHTML, marker) {
  const idx = renderedHTML.indexOf(marker);
  if (idx === -1) return null;
  const start = renderedHTML.lastIndexOf('<article', idx);
  const end = renderedHTML.indexOf('</article>', idx);
  if (start === -1 || end === -1) return null;
  return renderedHTML.slice(start, end + '</article>'.length);
}

async function smokeTest() {
  const { document, errors } = loadPage();

  assert(document.querySelector('#out'), '#out element should exist after initial load');

  const initialHTML = getOutHTML(document);
  assert(initialHTML.length > 0, '#out should have rendered content immediately after the inline script runs (initial run() call)');

  // Exercise each required control once to confirm the delegated `change`
  // dispatcher wiring runs end-to-end without throwing. The engine re-renders
  // on a 40ms debounce, so give it time to settle before reading #out again.
  setValue(document, '#st', '09:00');
  setValue(document, '#dm', 'flight');
  setValue(document, '#dt', '20:00');
  selectRadio(document, '#g-tr', 'bike');
  selectRadio(document, '#g-gr', 'kid');
  selectRadio(document, '#g-pc', 'pck');
  toggleCheckbox(document, '#g-in', 'nature');

  await delay(100);

  const afterHTML = getOutHTML(document);
  assert(afterHTML.length > 0, '#out should still have rendered content after dispatching change events on all required controls');

  if (errors.length) {
    throw new Error(`Page raised ${errors.length} error(s) during load/interaction: ${errors.map(String).join('; ')}`);
  }
}

/**
 * Task 8.1 — Peak-window golden test (Req 10.5 worked example).
 *
 * Flight departs 8:00 PM (dt=20:00). The flight branch of the Return_Deadline
 * formula is `dt-(pk(dt-120)?150:120)-75-20`. dt-120 = 1080 min (6:00 PM),
 * which falls inside the 4-7 PM peak window (960-1140 min), so pk(1080) is
 * true and the 150-minute airport-arrival buffer applies:
 *   ret = 1200 - 150 - 75 - 20 = 955 min = 3:55 PM
 * This exercises the task-3 fix, which changed the pk() call-site argument
 * from `pk(dt)` to `pk(dt-120)` so the peak check looks at the actual
 * airport-arrival candidate time rather than the flight departure time.
 */
async function testPeakWindowGolden() {
  const { document, errors } = loadPage();

  // Set dm=flight. This both runs the #dm onchange handler (which defaults
  // #dt to 20:00 for flight) and the delegated change dispatcher, which sets
  // tuned=true because 'flight' !== TDEF.dm ('none').
  setValue(document, '#dm', 'flight');

  // Per the dm onchange handler, #dt should now already read 20:00 — but
  // set it explicitly to be deterministic regardless of that default wiring.
  if (document.querySelector('#dt').value !== '20:00') {
    setValue(document, '#dt', '20:00');
  }

  // Trigger an additional fine-tune change so Tuned_State is unambiguously
  // true (per task 5's wiring, any fine-tune control change sets tuned=true).
  // Changing #st does not affect the Return_Deadline formula (ret depends
  // only on dm/dt), so it cannot interfere with the "Back by" value asserted
  // below.
  setValue(document, '#st', '09:00');

  // Wait out the page's 40ms re-render debounce.
  await delay(100);

  const html = getOutHTML(document);

  assert(html.includes('class="bar"'), 'Summary_Tiles bar should render once tuned is true');
  assert(
    /Back by<\/small><b class="mono">3:55 PM<\/b>/.test(html),
    `Summary_Tiles "Back by" value should read exactly "3:55 PM" — got: ${html}`
  );

  if (errors.length) {
    throw new Error(`Page raised ${errors.length} error(s) during the peak-window golden test: ${errors.map(String).join('; ')}`);
  }
}

/**
 * Task 8.2 — Maggi inclusion golden tests (Req 7.1, 7.2, 7.3), three independent
 * branches of the task-4 fix:
 *   if(mt&&mt.mt&&tr!=='none'&&(!sel.length||sel.some(s=>mx.tg.includes(s))))
 *
 * All three cases use a Mountain_Trip-eligible day-mode window: the page's
 * defaults (#st=08:00, #dm=none → #dt=17:00, tr=car) already give a 9-hour
 * usable window, which is wide enough for the `land` (Landour, mt:1) stop to
 * be selected as the Mountain_Trip anchor — so no fine-tune changes to the
 * window itself are needed, only to the vibe checkboxes.
 *
 * The Maggi stop (`D` entry with `onroute:1`) is only ever added to the
 * assembled itinerary `S` (and thus only ever rendered via `tline()`'s
 * `stop()` markup, which includes `x.n` in an `<h4>`) when a Mountain_Trip
 * stop is present — it is filtered out of the generic candidate list `C`
 * (`if(d.onroute)continue;`), so it can never appear in the "More ideas" /
 * "Best matches" / "Famous cafés & restaurants" rails. Checking for its name
 * text in the rendered HTML is therefore a reliable presence/absence signal.
 */
const MAGGI_NAME = 'Maggi stop on Mussoorie Road';

function assertMountainTripSelected(html, label) {
  // Sanity-check the shared assumption underlying all three cases: a
  // Mountain_Trip stop (land/geo/bha) actually got selected under the
  // default day-mode window. If this ever fails, the window needs widening
  // rather than the Maggi assertions being meaningless.
  assert(
    /Lal Tibba|Cloud End|Bhadraj/.test(html),
    `${label}: expected a Mountain_Trip stop (Landour/Everest/Bhadraj) to be selected under the default day-mode window — got: ${html}`
  );
}

async function testMaggiInclusionNoVibes() {
  const { document, errors } = loadPage();

  // tr=car is already the control-panel default; select it explicitly to
  // match the "against ... with tr=car" case description.
  selectRadio(document, '#g-tr', 'car');

  await delay(100);
  const html = getOutHTML(document);

  assertMountainTripSelected(html, 'Maggi (a) zero vibes');
  assert(html.includes(MAGGI_NAME), `Maggi (a) zero vibes: expected the Maggi stop to be present — got: ${html}`);

  if (errors.length) {
    throw new Error(`Page raised ${errors.length} error(s) during Maggi test (a): ${errors.map(String).join('; ')}`);
  }
}

async function testMaggiInclusionMatchingVibe() {
  const { document, errors } = loadPage();

  selectRadio(document, '#g-tr', 'car');
  // 'food' is one of Maggi's tags (tg:['food','views']).
  toggleCheckbox(document, '#g-in', 'food');

  await delay(100);
  const html = getOutHTML(document);

  assertMountainTripSelected(html, 'Maggi (b) matching vibe');
  assert(html.includes(MAGGI_NAME), `Maggi (b) matching vibe ("food"): expected the Maggi stop to be present — got: ${html}`);

  if (errors.length) {
    throw new Error(`Page raised ${errors.length} error(s) during Maggi test (b): ${errors.map(String).join('; ')}`);
  }
}

async function testMaggiInclusionNonMatchingVibe() {
  const { document, errors } = loadPage();

  selectRadio(document, '#g-tr', 'car');
  // 'adventure' shares no tag with Maggi (tg:['food','views']).
  toggleCheckbox(document, '#g-in', 'adventure');

  await delay(100);
  const html = getOutHTML(document);

  assertMountainTripSelected(html, 'Maggi (c) non-matching vibe');
  assert(!html.includes(MAGGI_NAME), `Maggi (c) non-matching vibe ("adventure"): expected the Maggi stop to be absent — got: ${html}`);

  if (errors.length) {
    throw new Error(`Page raised ${errors.length} error(s) during Maggi test (c): ${errors.map(String).join('; ')}`);
  }
}

/**
 * Task 8.3 — Tuned-state visibility golden test (Req 23.1, 23.2, 23.3),
 * covering the task-5 fix: Summary_Tiles (`.bar`) is only rendered once the
 * user has touched a fine-tune control (`tuned===true`), and resets back to
 * hidden whenever the day-mode/evening-mode radio (`input[name=md]`, rendered
 * inside `#g-md`) changes.
 *
 * Three stages, same loaded page throughout:
 *   1. Immediately after `loadPage()` (before any interaction) — the page's
 *      own initial script-driven `run()` call has already executed with the
 *      default `tuned=false`, so `.bar` must be absent.
 *   2. After dispatching one `change` on `#st` with a non-default value
 *      (default is `08:00`; using `09:00`) — the delegated change dispatcher
 *      sets `tuned=true` because the new value differs from `TDEF.st`, so
 *      `.bar` must now be present.
 *   3. After dispatching a mode-change event on the `eve` radio inside
 *      `#g-md` — its `onchange` handler (task 5.3) sets `tuned=false`
 *      directly, so after the re-render `.bar` must be absent again.
 */
async function testTunedStateVisibility() {
  const { document, errors } = loadPage();

  const initialHTML = getOutHTML(document);
  assert(
    !initialHTML.includes('class="bar"'),
    `Tuned (initial): expected Summary_Tiles bar to be absent before any interaction — got: ${initialHTML}`
  );

  setValue(document, '#st', '09:00');
  await delay(100);

  const tunedHTML = getOutHTML(document);
  assert(
    tunedHTML.includes('class="bar"'),
    `Tuned (after #st change): expected Summary_Tiles bar to be present once tuned becomes true — got: ${tunedHTML}`
  );

  selectRadio(document, '#g-md', 'eve');
  await delay(100);

  const resetHTML = getOutHTML(document);
  assert(
    !resetHTML.includes('class="bar"'),
    `Tuned (after mode change): expected Summary_Tiles bar to be absent again once tuned resets on mode change — got: ${resetHTML}`
  );

  if (errors.length) {
    throw new Error(`Page raised ${errors.length} error(s) during the tuned-state visibility golden test: ${errors.map(String).join('; ')}`);
  }
}

/**
 * Task 8.4 — Catalog-correction assertions (Req 18.1-18.6, 16.2), covering the
 * task-2 data fixes to the `E` (Eatery_Catalog) array.
 *
 * `E` lives inside the page's IIFE closure and isn't exposed on `window`, so
 * two complementary layers are used:
 *
 *  1. Raw-source checks against the page's static HTML text (the `html`
 *     constant this file already read at module load, before jsdom parses
 *     it). These are deterministic and independent of `pickE`'s scoring/
 *     ranking algorithm, which only ever surfaces a top-6 slice of the
 *     catalog in any one rendered rail — a reliable way to confirm the
 *     `mlc`/`ycf` entries are gone and the `ama`/`hig`/`rdr`/`koi` fields are
 *     byte-for-byte what task 2 specifies, regardless of ranking.
 *  2. Rendered-output checks against the default-loaded page's "Famous
 *     cafés & restaurants" rail, which — given the catalog's fixed `le`
 *     weights and tag sets — deterministically ranks `kfc, ama, pic, ell,
 *     ter, rdr` into its top 6 slots when no vibe checkboxes are selected
 *     (the page's own default state). This confirms the corrected names
 *     actually reach the DOM, not just the source text, and that `rdr`
 *     renders its "Check hours" pill and original placeholder `hr` text.
 *
 * `koi` has the same `le`/tag profile as `rdr` (`le:.7`, `tg:['food']`) but
 * sits after `rdr`, `ter`, and `hig` in array order, so it never wins a
 * ranking tie-break and can never appear in a top-6 rail slice under any
 * vibe-checkbox combination — it is therefore verified via the raw-source
 * layer only, same as `mlc`/`ycf`'s absence.
 */
async function testCatalogCorrections() {
  // --- Layer 1: raw page source (deterministic, ranking-independent) ---
  assert(!html.includes('Kalsang Ama Café'), 'Catalog (source): "Kalsang Ama Café" should no longer appear anywhere in the page source');
  assert(!html.includes("id:'mlc'"), 'Catalog (source): the mlc entry (id:\'mlc\') should have been deleted from E');
  assert(!html.includes("id:'ycf'"), 'Catalog (source): the ycf entry (id:\'ycf\') should have been deleted from E');
  assert(!html.includes('Mussoorie Lights Café & Bar'), 'Catalog (source): the deleted mlc entry\'s name should not appear anywhere in the page source');
  assert(!html.includes('Y Café & Restaurant'), 'Catalog (source): the deleted ycf entry\'s name should not appear anywhere in the page source');
  assert(html.includes('AMA Café'), 'Catalog (source): the renamed ama entry\'s name "AMA Café" should appear in the page source');
  assert(html.includes('The Highland Bakehouse & Pizzeria'), 'Catalog (source): the renamed hig entry\'s name should appear in the page source');
  assert(
    html.includes("{id:'rdr',ty:'cafe',n:'Readers Coffee House',tg:['food'],tv:30,le:.7,u:1,rt:'city',hr:'Check address and hours'"),
    'Catalog (source): the rdr entry should remain unchanged — still u:1 with its original "Check address and hours" placeholder'
  );
  assert(
    html.includes("{id:'koi',ty:'cafe',n:'Koi',tg:['food'],tv:30,le:.7,u:1,rt:'city',hr:'Check address and hours'"),
    'Catalog (source): the koi entry should remain unchanged — still u:1 with its original "Check address and hours" placeholder'
  );

  // --- Layer 2: rendered output on the default-loaded page (no interaction) ---
  const { document, errors } = loadPage();
  const outHTML = getOutHTML(document);

  assert(outHTML.includes('AMA Café'), `Catalog (rendered): expected "AMA Café" to render in the Famous cafés & restaurants rail — got: ${outHTML}`);
  assert(!outHTML.includes('Kalsang Ama Café'), `Catalog (rendered): "Kalsang Ama Café" should never render — got: ${outHTML}`);
  assert(!outHTML.includes('Mussoorie Lights Café & Bar'), `Catalog (rendered): the deleted mlc entry's name should never render — got: ${outHTML}`);
  assert(!outHTML.includes('Y Café & Restaurant'), `Catalog (rendered): the deleted ycf entry's name should never render — got: ${outHTML}`);
  assert(outHTML.includes('Readers Coffee House'), `Catalog (rendered): expected "Readers Coffee House" (rdr) to render in the Famous cafés & restaurants rail on the default-loaded page — got: ${outHTML}`);

  const rdrCard = extractCard(outHTML, 'Readers Coffee House');
  assert(rdrCard, `Catalog (rendered): could not locate rdr's rendered <article> card — got: ${outHTML}`);
  assert(rdrCard.includes('Check hours'), `Catalog (rendered): rdr's card should show the "Check hours" badge — got: ${rdrCard}`);
  assert(
    rdrCard.includes('Check address and hours'),
    `Catalog (rendered): rdr's card should show its original placeholder hr text "Check address and hours", not fabricated data — got: ${rdrCard}`
  );

  if (errors.length) {
    throw new Error(`Page raised ${errors.length} error(s) during the catalog-correction golden test: ${errors.map(String).join('; ')}`);
  }
}

Promise.resolve()
  .then(smokeTest)
  .then(testPeakWindowGolden)
  .then(testMaggiInclusionNoVibes)
  .then(testMaggiInclusionMatchingVibe)
  .then(testMaggiInclusionNonMatchingVibe)
  .then(testTunedStateVisibility)
  .then(testCatalogCorrections)
  .then(() => {
    console.log('smoke: OK — page loaded, inline script executed, #out rendered, no errors thrown');
    console.log('golden (8.1): OK — flight dt=20:00 peak-window Return_Deadline renders "Back by 3:55 PM"');
    console.log('golden (8.2a): OK — zero vibes selected, Maggi stop present alongside a Mountain_Trip stop');
    console.log('golden (8.2b): OK — vibe "food" (matches Maggi tag) selected, Maggi stop present');
    console.log('golden (8.2c): OK — vibe "adventure" (no shared tag) selected, Maggi stop absent');
    console.log('golden (8.3): OK — .bar absent initially, present after a fine-tune change, absent again after a mode change');
    console.log('golden (8.4): OK — mlc/ycf deleted and absent, ama/hig renamed names present, rdr/koi unchanged with placeholder hr text');
  })
  .catch((err) => {
    console.error('smoke test FAILED:', err);
    process.exitCode = 1;
  });
