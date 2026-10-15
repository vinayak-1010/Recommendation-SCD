# Implementation Plan

## Overview

This plan covers 10 tasks to fix and polish `scd-explore-doon.html`: a CSS overflow fix, catalog data corrections, a `pk()` peak-window bug fix, a Maggi on-route inclusion bug fix, a Tuned_State flag with Summary_Tiles gating, a minimal text/UI pass, a Node + jsdom test harness, golden tests for the behavioral fixes, property-style checks for the Correctness Properties, and a final verification pass. All work happens inside the single file `scd-explore-doon.html` (plus one new lightweight test script). No new runtime files, no build step, no frameworks are introduced, per design.md's "Architecture" and Req 21.5.

## Tasks

- [x] 1. Fix responsive layout overflow in `scd-explore-doon.html`
  - Add `overflow-x:hidden` to the `html{...}` rule as the root-level safety net.
  - Change `.grid{grid-template-columns:380px 1fr;...}` inside `@media(min-width:900px)` to `380px minmax(0,1fr)`.
  - Add `#out{min-width:0}` so the output column can shrink below its content's intrinsic width.
  - Change `.bar{grid-template-columns:repeat(3,1fr)}` to `repeat(3,minmax(0,1fr))`.
  - Do not add any new breakpoints beyond the existing `@media(min-width:900px)` rule.
  - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [x] 2. Apply catalog data corrections to the `E` (Eatery_Catalog) array
  - [x] 2.1 Rename the `ama` entry's `n` field from `'Kalsang Ama Café'` to `'AMA Café'`, leaving `hr`, `u:1`, `tg`, and all other fields unchanged.
    - _Requirements: 18.1_
  - [x] 2.2 Delete the `mlc` ("Mussoorie Lights Café & Bar") object literal entirely from `E`.
    - _Requirements: 18.2_
  - [x] 2.3 Delete the `ycf` ("Y Café & Restaurant") object literal entirely from `E`.
    - _Requirements: 18.3_
  - [x] 2.4 Rename the `hig` entry's `n` field from `'Highland Café'` to `'The Highland Bakehouse & Pizzeria'`. Keep `u:1`, the generic `hr:'Check address and hours'`, and the existing placeholder `note` text unchanged — do not fabricate address, real hours, price, or tags; those remain an open question (requirements.md Open Question #1) until the owner supplies them.
    - _Requirements: 18.4_
  - [x] 2.5 Leave the `rdr` (Readers Coffee House) and `koi` entries byte-for-byte unchanged — both stay `u:1` with their existing `'Check hours'`/`'Check address and hours'` placeholder text. Do not fetch or invent data for either (requirements.md Open Questions #2 and #3).
    - _Requirements: 18.5, 18.6_
  - Verify no other code references the removed `mlc`/`ycf` ids by id (only generic `ty`/`tg` filters in `pickE`/`row` touch `E`, so no further code changes should be needed).

- [x] 3. Fix the `pk()` peak-window call site for flight Return_Deadline math
  - In `run()`, change the flight branch of the `ret = ...` ternary from `dm==='flight'?dt-(pk(dt)?150:120)-75-20` to `dm==='flight'?dt-(pk(dt-120)?150:120)-75-20`.
  - Leave the `pk()` function definition itself (`const pk=m=>...`) unchanged — only the call-site argument changes.
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 4. Fix the Maggi on-route inclusion operator-precedence bug
  - In the `run()` itinerary-assembly block, change the condition `if(mt&&mt.mt&&tr!=='none'&&sel.some(s=>mx.tg.includes(s)||!sel.length))` to `if(mt&&mt.mt&&tr!=='none'&&(!sel.length||sel.some(s=>mx.tg.includes(s))))`, pulling `!sel.length` out as an independent top-level OR operand so it no longer depends on `.some()` being invoked on a (possibly empty) `sel` array.
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 5. Add Tuned_State (`tuned`) flag and gate Summary_Tiles on it
  - [x] 5.1 Declare a module-level `let tuned=false;` alongside the other top-level state in the IIFE.
    - _Requirements: 23.1_
  - [x] 5.2 Extend the existing delegated `document.addEventListener('change', e=>{...})` handler to update `tuned`: for the fine-tune time/mode fields (`id` of `st`, `dm`, `dt`), set `tuned` true when the new value differs from that field's current default; for any other named fine-tune control that changed (`tr`, `gr`, `pc`, vibe checkboxes named `in`), set `tuned=true` unconditionally on change. Do this without adding a second listener — extend the existing delegated handler body per design.md section "Control_Panel and the `change` dispatcher".
    - _Requirements: 3.5, 23.1, 23.2_
  - [x] 5.3 In the existing `document.querySelectorAll('input[name=md]').forEach(i=>i.onchange=()=>{...})` mode-change handler, add `tuned=false;` so Tuned_State resets whenever mode changes between "Sunday day" and "Evening & night".
    - _Requirements: 23.3_
  - [x] 5.4 In both `run()` and `eve()`, change the Summary_Tiles construction so the `barH(...)` markup is only included when `tuned` is true (e.g. `let h = tuned ? barH(...) : '';`), while leaving warnings (`W`), the daylight notice, `tline(...)`, and `row(...)` output unconditional/unaffected by `tuned`.
    - _Requirements: 23.1, 23.2_

- [x] 6. Apply the minimal text/UI pass
  - [x] 6.1 Remove the `'<span class="pl ok">Looks open</span>'` branch from the `pill()` helper so non-unverified entries render no status pill (type/Hill-trip/Strenuous pills, if applicable, are unaffected).
    - _Requirements: 24.2_
  - [x] 6.2 Add `display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden` to the `.by p` CSS rule (the `.mini p` 3-line clamp stays as-is).
    - _Requirements: 24.3_
  - [x] 6.3 Shorten the hero `<h2>` and `.lead` paragraph markup in place, keeping the official accent/token usage (`#AD5CFF`, existing font stacks) unchanged.
    - _Requirements: 24.1_
  - [x] 6.4 Shorten the footer `.ft` paragraph while retaining, in condensed form, all three Req 16.3 warnings: hours/prices/entry-rules change often, Unverified/Check-hours items need a call before visiting, and alcohol is for adults only.
    - _Requirements: 24.4, 16.3_
  - [x] 6.5 Reduce spacing token values: `.hd{margin-bottom:20px}` → `16px`, `.hero{padding:4px 0 18px}` → `2px 0 14px` (and its `@media(min-width:900px)` override `8px 0 24px` → `6px 0 18px`), and `.grid{gap:20px}` → `16px` (its desktop override `gap:28px` → `22px`). Do not change border-radius values, button shadow tokens, or color tokens.
    - _Requirements: 24.5, 21.1, 21.2_

- [x] 7. Set up a Node + jsdom smoke-test harness
  - Initialize a minimal `package.json` (no existing one in the repo) with `jsdom` as a pinned exact-version dev dependency, and create `test/smoke.mjs` as the test entry point.
  - The script loads `scd-explore-doon.html` into a `jsdom` `JSDOM` instance (with `runScripts:'dangerously'`, `resources:'usable'` as needed) so the page's inline script executes, exposing a way to dispatch synthetic `change` events on `#st`, `#dm`, `#dt`, `#g-tr`/`#g-gr`/`#g-pc`/`#g-in` inputs and read back `#out.innerHTML`.
  - Keep the harness dependency-minimal and manual-run (e.g. `node test/smoke.mjs`), per design.md's Testing Strategy — it is not wired into any CI, since the project has none.
  - Files: `package.json`, `test/smoke.mjs`
  - Verify: `node test/smoke.mjs` runs to completion without throwing (even before the golden-test assertions in tasks 8–9 are added, a trivial smoke load-and-render should succeed).

- [x] 8. Write golden tests for the behavioral fixes (depends on tasks 2, 3, 4, 5)
  - [x] 8.1 Peak-window golden test: set `dm=flight`, `dt=20:00` (8:00 PM), trigger a change so `tuned` becomes true, and assert the rendered Summary_Tiles "Back by" value reads `3:55 PM` — the Req 10.5 worked example, exercising the task-3 fix.
    - _Requirements: 10.5_
  - [x] 8.2 Maggi inclusion golden tests, three cases against a Mountain_Trip-eligible day-mode window with `tr=car`: (a) zero vibes selected → assert the `id==='maggi'` card is present; (b) one vibe selected that matches a Maggi tag → assert present; (c) vibes selected that share no tag with Maggi → assert absent. Covers the task-4 fix as three independent branches.
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 8.3 Tuned-state visibility golden test: on initial render (no interaction) assert `.bar` is absent from `#out`; dispatch one `change` on `#st` with a non-default value and assert `.bar` is now present; dispatch a mode-change event and assert `.bar` is absent again. Covers the task-5 fix.
    - _Requirements: 23.1, 23.2, 23.3_
  - [x] 8.4 Catalog-correction assertions: assert the loaded page's `E` table (or its rendered output across the relevant suggestion rails) contains no entry named `'Kalsang Ama Café'` and no `id==='mlc'`/`id==='ycf'`, does contain `'AMA Café'` and `'The Highland Bakehouse & Pizzeria'`, and that `rdr`/`koi` still render a `Check hours` badge with their original placeholder `hr` text (not fabricated data). Covers task 2.
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 16.2_
  - [x] 8.5 "Looks open" pill removal assertion: render at least one non-unverified entry and assert no element with class `pl ok` / text "Looks open" appears anywhere in `#out`. Covers task 6.1.
    - _Requirements: 24.2_
  - Files: `test/smoke.mjs` (extended)
  - Verify: `node test/smoke.mjs` — all assertions in 8.1–8.5 pass (process exits 0; any failed assertion throws/exits non-zero).

- [x] 9. Write property-style checks for the Correctness Properties that are practical under jsdom (depends on task 8's harness)
  - Implement lightweight randomized/fuzz checks (fixed small seed set is acceptable, no new dependency beyond `jsdom`) for the properties that don't require real CSS layout:
    - Property 1 (Return_Deadline consistency) and Property 2 (peak-window argument) by calling the extracted `pk`/ret-formula logic with varied `dt` values.
    - Property 3 (Mountain_Trip daylight bound) and Property 4 (at most one Mountain_Trip/Full_Day_Trip stop) and Property 5 (itinerary finishes within deadline) by driving `run()` across varied `st`/`dm`/`dt`/`tr`/`gr`/`pc` combinations and inspecting the rendered stop list/times.
    - Property 6 (score non-negativity) by sampling rendered candidates across inputs and confirming no visible negative-score artifact (e.g. cross-checking relative ordering stays consistent with a non-negative floor).
    - Property 7 (Maggi inclusion independent OR) as a direct unit check on the fixed predicate from task 4.
    - Property 8 (no bar/club leakage for family groups) by rendering with `gr=kid` and `gr=eld` plus `in=night` and asserting zero `.pl` type pills of `Bar & lounge`/`Club` appear.
    - Property 9 (no fabricated facts for unverified entries) by scanning rendered `u:1` entries for only placeholder `hr` text.
  - Explicitly skip Property 10/11 (already covered as golden tests in 8.3) and Property 12 (horizontal overflow) here — jsdom does not perform real CSS Grid layout, so Property 12 is deferred to task 10 as a manual/browser-based check, stated plainly rather than claimed as automated.
  - Files: `test/smoke.mjs` (extended) or a new `test/properties.mjs` loaded by the same `node` invocation.
  - Verify: `node test/smoke.mjs` (and/or `node test/properties.mjs`) — all property checks pass across the sampled input combinations.

- [x] 10. Final verification pass (depends on tasks 1–9)
  - Run the full smoke/property test suite (`node test/smoke.mjs` plus any separate property script from task 9) and confirm all assertions pass.
  - Manually verify no horizontal page scroll at 1280px, 1440px, and 1920px viewport widths by opening `scd-explore-doon.html` directly in a real browser (jsdom cannot compute CSS Grid layout, so this step cannot be automated without adding a browser-automation dependency such as Playwright, which is out of scope here) — document the result as a manual check per design.md's Testing Strategy, not an automated one.
  - Confirm the file still satisfies the single-file/no-build constraint: `scd-explore-doon.html` remains the only file required to run the page (no new `<script src>`/`<link>` to local build artifacts were introduced), and the new `package.json`/`test/` files are test-only tooling that the page itself does not depend on at runtime.
  - Re-skim the diff against `requirements.md` Open Questions #1–#6 to confirm none were silently resolved with invented data (Highland real fields, Readers Coffee House, "koi", image filename list, city-to-city travel estimate, lunch trim-priority all remain untouched/placeholder).
  - _Requirements: 21.5, 22.1, 22.2, 22.3, 22.4_

- [x] 11. Phase 0: Characterization Tests & Repo Hygiene
  - Freeze today's baseline behavior in `test/characterization.mjs`
  - Move images from `scd images/` to `public/images/` and update `.gitignore` to ignore `node_modules/`
  - Set up steering files and engine diagnosis documentation

- [x] 12. Phase 1: Data Schemas, Extraction & Linting
  - Extract datasets to `data/` (`places.json`, `eateries.json`, `clusters.json`, `routes.json`, `traffic.json`, `rules.json`, `copy.json`, `config.json`)
  - Create `scripts/lint-data.ts` and configure `npm run data:lint`
  - Auto-generate `docs/DATA-VERIFICATION-CHECKLIST.md`

- [x] 13. Phase 1: Core Engine Implementation
  - Pure TypeScript engine in `src/engine/` (`types.ts`, `daylight.ts`, `traffic.ts`, `matrix.ts`, `filters.ts`, `scorer.ts`, `assembler.ts`, `narration.ts`)
  - Objective scoring function with max-affinity credit, diversity penalties, and P80 return buffer
  - Golden Scenarios 1–10 automated test suite

- [x] 14. Phase 2: Mussoorie & Landour Content Expansion
  - Seed cluster definitions for Clement Town, Rajpur, Mussoorie Town, Landour, Park Estate, East Doon
  - Calibrate O-D matrix and directional traffic profiles
  - Encode regulatory rules (tourist registration, Mall Road evening closures, two-wheeler advisories)
  - Verify engine discovers the 7 blueprints without hardcoding

- [x] 15. Phase 3: Alternatives & `replan()` Engine
  - Contextual alternatives generator (up to 2 per swappable stop with delta time)
  - Interactive mutation operators: swap, drop, lock, extend, shiftStart
  - "Another plan" and flavor variants (Closer, Calmer, Bolder)

- [x] 16. Phase 4: Apple-Grade Design System & UI Rebuild
  - Token system in `src/styles/tokens.css` with dark/light themes and glass materials
  - Signature Day Dial 5 AM–11 PM scrubber with traffic heat strip and sunset markers
  - Interactive Route Ribbon timeline with FLIP transitions
  - Detent bottom sheets for stop detail and alternatives

- [x] 17. Phase 5: Maps Integration & Deep Links
  - Layer 1: Google Maps deep links (`/maps/dir/` and `/maps/search/`) with waypoints
  - Layer 2: On-demand Google Maps Embed API integration with lazy loading
  - Layer 3: Keyless offline-capable route visualizer styled in brand tokens

- [x] 18. Phase 5: Missing Product Features
  - Shareable itinerary URL hash state & ICS calendar file export
  - Offline-first Service Worker and PWA manifest
  - Multi-language Hindi / English translation
  - Event helper ("Plan around SCD keynote / sessions")
  - Diet (veg-first) and budget filters with party size cost splitting

- [x] 19. Phase 6: Performance, Accessibility & Embedding
  - Lighthouse mobile audit >= 95, WCAG AA compliance, allow pinch-zoom
  - `<iframe>` embed contract with auto-height postMessage
  - Single-file build generator (`npm run build:single`)

- [x] 20. Phase 6: Cloud Deployment & Documentation
  - AWS CloudFormation static hosting template in `infra/`
  - GitHub Actions CI/CD workflow
  - Complete `docs/CHANGELOG-ENGINE.md` and user calibration guide


## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1, 2, 3, 4, 5, 6, 7] },
    { "wave": 2, "tasks": [8] },
    { "wave": 3, "tasks": [9] },
    { "wave": 4, "tasks": [10] }
  ]
}
```

```
1 (CSS overflow fix)        ─┐
2 (catalog corrections)      │
3 (pk() fix)                 ├─► 8 (golden tests, depends on 2,3,4,5) ─► 9 (property checks) ─► 10 (final verification)
4 (Maggi fix)                │
5 (tuned flag + gating)      │
6 (minimal text/UI pass)    ─┘
7 (test harness setup) ──────────► 8
```

## Notes
- Tasks 1–6 each touch disjoint regions of `scd-explore-doon.html` (CSS block, `E` array, `pk()` call site, Maggi condition, `change`/`md` handlers + `run()`/`eve()` tile gating, and `pill()`/CSS/copy respectively) and have no dependencies on each other — they may be done in any order, but are listed in an order that keeps related edits (data vs. logic vs. styling) grouped together.
- Task 7 (test harness) has no dependency on 1–6 and can be done in parallel with them, but must exist before task 8's golden tests can be written.
- Task 8 depends on tasks 2, 3, 4, 5 (it asserts the specific fixes those tasks make) and on task 7 (the harness it runs in).
- Task 9 depends on task 8 (reuses/extends the same harness and loaded-page fixture).
- Task 10 depends on all preceding tasks: it re-runs every automated check and performs the manual overflow/no-build checks that only make sense once every code change (tasks 1–6) is in place.
