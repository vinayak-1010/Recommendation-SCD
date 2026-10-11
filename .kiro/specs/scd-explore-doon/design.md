# Design Document

## Overview

Explore Doon stays what it already is: one self-contained HTML file (`scd-explore-doon.html`) with inline `<style>` and a single inline `<script>` IIFE, no build step, no runtime dependencies other than the two Google Fonts and an inline SVG `<symbol>` sprite for icons. This design does not introduce a new architecture — it specifies how the existing control-panel → engine → renderer → `postMessage` pipeline is extended to close the gaps between the current baseline and `requirements.md`.

The work falls into five buckets, all inside the same file:

1. **Layout/CSS fix** so the two-column grid never forces horizontal page scroll at any supported viewport width (Req 22), plus a minimal-text/spacing pass (Req 24) that keeps the existing token set.
2. **A new `tuned` state flag** that governs whether the Summary_Tiles bar is rendered at all (Req 23), replacing the current "always show the bar" behavior.
3. **A corrected `pk()` peak-window check** so flight return-by math tests airport-*arrival* time instead of departure time (Req 10), fixing the current bug where `pk(dt)` is called with the departure time.
4. **Catalog data corrections** to the `E` table (rename, remove two entries, swap the Highland placeholder) while leaving genuinely unresolved entries (`rdr`, `koi`, Highland's real fields) as explicit "Check hours" placeholders rather than inventing data (Req 18, carried-forward open questions).
5. **Formal documentation of baseline logic that already exists in the shipped script** — hard filters, scoring, itinerary assembly/trimming, Maggi-stop inclusion (including the operator-precedence fix), lunch insertion, return-deadline formulas, daylight cutoff, group/travel-mode guidance, evening assembly, safety copy, Unverified badges, directions panels, image convention, and iframe embeddability — so the single file's behavior is traceable to specific requirements for future maintenance and review.

No new files, no new global state beyond `tuned`, no new network calls, no new catalog schema fields beyond what's needed for the corrections above.

## Architecture

The runtime shape is unchanged from the baseline:

```
URL params (embed/theme/transparent/img)
        │
        ▼
Control_Panel (#g-md, #g-in, fine-tune <details>)
        │  document-level 'change' listener (delegated)
        ▼
tuned flag update  →  run() or eve()  (Recommendation_Engine)
        │                                   │
        │                      filters → score → sort → assemble → trim
        ▼                                   ▼
show(html)  →  #out.innerHTML = html   →   send()  →  postMessage({scd:'h', h})
```

Everything lives in one `<script>` block structured, as today, into:

- **Data tables**: `D` (Place_Catalog), `E` (Eatery_Catalog), `R` (direction-step fragments keyed by `rt`), `TY`/`TRL`/`IN`/`VI`/`KD`/`SIL` (label/icon/art lookup tables).
- **Pure helpers**: `tm`, `fm`, `du`, `pk`, `pill`, `stp`, `ecard`, `art`, `mapL`, `cv`, `meta`, `go`, `vm`, `hw`, `stop`, `mini`, `tline`, `row`, `barH`.
- **Engine functions**: `eve()` (evening path) and `run()` (day path), each ending in `show(html)`.
- **Wiring**: the `grp()`-built control markup, the `#dm`/`#g-md`/`change` handlers, the delegated `document.addEventListener('change', …)` dispatcher with a 40ms debounce, and `send()`/`ResizeObserver`.

No module system, no classes, no build tooling is introduced. The design keeps the same "data table + pure scoring/assembly functions + one render pass" shape so a future maintainer editing the single file does not have to learn a new pattern.

## Components and Interfaces

### 1. Control_Panel and the `change` dispatcher

The delegated listener is extended to also maintain `tuned`:

```js
let tuned = false;
const DEFAULTS = {st:'08:00', dm:'none', dt:'17:00'}; // day-mode defaults; eve-mode defaults are set by the md handler
document.addEventListener('change', e => {
  const n = e.target;
  if (n.value === 'night' && n.checked && V('md') === 'day') { /* existing night→eve switch, unchanged */ }
  if (['st','dm','dt'].includes(n.id)) {
    tuned = tuned || (n.value !== DEFAULTS[n.id]);
  } else if (n.name && n.name !== 'md') {
    // tr/gr/pc/in changes away from their defaults also count as "tuned"
    tuned = true;
  }
  clearTimeout(tmr); tmr = setTimeout(run_or_eve, 40);
});
```

This keeps the existing single delegated-listener pattern (no per-control listeners added) and the existing 40ms debounce. `tuned` is checked by `id` for the three fine-tune time/mode fields named in the requirement (`st`, `dm`, `dt`) and more broadly by any other named fine-tune control (`tr`, `gr`, `pc`, vibe checkboxes) changing away from a default, since Req 3.5 says "any fine-tune control value away from its default" sets `Tuned_State` to true. Vibe (`in`) changes are fine-tune-adjacent inputs already covered by Req 2.3's "recompute and redisplay"; they are included in the broad branch because selecting a vibe is itself a deliberate adjustment away from the unconfigured state, consistent with Req 23's intent of not showing timing tiles the guest never confirmed.

The mode handler (`#g-md` change, i.e. `input[name=md]`) is the one place that **resets** `tuned`:

```js
document.querySelectorAll('input[name=md]').forEach(i => i.onchange = () => {
  tuned = false;
  // ...existing default-setting logic for st/dt/dm unchanged...
});
```

This satisfies Req 23.3 ("WHEN mode changes … reset Tuned_State to false") without adding a second listener mechanism — the existing per-radio `onchange` assignment used for the day/evening default-swap is reused.

### 2. `pk()` peak-window check (Requirement 10 fix)

Current baseline bug: `run()` calls `pk(dt)` (the flight/train departure time) to decide whether the Peak_Window buffer applies, but Req 10.2 requires testing the **airport-arrival time** (`dt-120`). The function signature is unchanged; only the call site changes:

```js
const pk = m => (m>=960&&m<1140)||(m>=300&&m<480); // unchanged: tests a minute-of-day value
// ...
let ret = dm==='flight' ? dt-(pk(dt-120)?150:120)-75-20
        : dm==='train'  ? dt-45-45-20
        : dt;
```

Worked example per Req 10.5: flight departs 20:00 (1200 min). Airport-arrival candidate = 1200-120 = 1080 min = 18:00, which falls in the 960–1140 (4:00–7:00 PM) Peak_Window, so the Peak_Window buffer applies: `ret = 1200-150-75-20 = 955` min = **15:55 (3:55 PM)**. This matches Req 10.5 exactly and becomes the golden-test fixture (see Testing Strategy).

### 3. Catalog corrections (`E` table)

Four targeted edits to the existing `E` array literal, no schema change:

- **`ama` rename**: `n:'Kalsang Ama Café'` → `n:'AMA Café'`. All other fields (`hr:'Rajpur Road · check hours'`, `u:1`, tags) stay as-is per Req 18.1 — only the display name changes.
- **Remove `mlc`** (Mussoorie Lights Café & Bar) and **remove `ycf`** (Y Café & Restaurant) — delete both object literals from `E` entirely (Req 18.2, 18.3). No other entry references their ids (`pickE` filters by `ty`/`tg`, not by id, so removal is safe and requires no change to `pickE`, `row`, or the suggestion-rail logic).
- **`hig` replacement**: baseline has a placeholder "Highland Café" object. Replace its `n` field with `'The Highland Bakehouse & Pizzeria'` but **keep `u:1`** and the generic `hr:'Check address and hours'` note, since the owner has not yet supplied verified address/hours/price/tags (open question #1 below). The `note` field keeps language flagging it as owner-suggested-but-unconfirmed rather than inventing specifics.
- **`rdr` (Readers Coffee House) and `koi`**: no change — both remain exactly as in the baseline (`u:1`, `hr:'Check address and hours'` / `hr:'Check hours'`), per Req 18.5 and 18.6, until real data arrives.

```js
// before: {id:'ama',ty:'cafe',n:'Kalsang Ama Café', ...}
// after:
{id:'ama',ty:'cafe',n:'AMA Café',tg:['food','views'],tv:30,le:.9,u:1,rt:'city',hr:'Rajpur Road · check hours',note:'One of the longest-running cafés in the city. Tibetan, Thai and continental plates, plus pizza and pasta in a cosy room.'},
// mlc, ycf entries: deleted
// hig entry (name swapped, everything else unchanged pending owner data):
{id:'hig',ty:'cafe',n:'The Highland Bakehouse & Pizzeria',tg:['food','views'],tv:30,le:.7,u:1,rt:'city',hr:'Check address and hours',note:'Suggested by the AWS SBG team. Confirm the address and hours before you go.'}
```

Because `pickE()` and the suggestion rails (`row(...)`) iterate the `E` array generically, no engine code change is needed beyond the data edits themselves.

### 4. Layout/overflow fix (Requirement 22)

Three concrete CSS changes, applied at the existing `@media(min-width:900px)` breakpoint and to the always-on rules, with no new breakpoints added (the requirement only names "900px or greater" and no horizontal scroll at any width, so a single breakpoint fix plus generic min-width:0 safety nets suffice):

```css
/* existing: html{...} body{...} */
html{overflow-x:hidden} /* Req 22.4 safety net on the root scrolling container */

@media(min-width:900px){
  .grid{grid-template-columns:380px minmax(0,1fr);gap:28px;align-items:start} /* was: 380px 1fr */
}
#out{min-width:0} /* Req 22.2: output column must not impose a min-width wider than its grid track */
.bar{grid-template-columns:repeat(3,minmax(0,1fr))} /* Req 22.3: tiles shrink instead of forcing width */
```

`minmax(0,1fr)` is the standard CSS Grid fix for the classic "grid item with text/flex content refuses to shrink below its content's intrinsic width" overflow bug — it's a one-line, token-neutral change consistent with "no new architecture." The `.rail` horizontal scroller already uses `overflow-x:auto` deliberately (card carousel) and is untouched; it scrolls inside its own column and does not affect page-level horizontal scroll because its parent columns are now correctly constrained.

Verification approach: a manual/jsdom check that `document.documentElement.scrollWidth <= window.innerWidth` (or, in a real browser, visually) at 1280/1440/1920px — see Testing Strategy.

### 5. Minimal text/UI pass (Requirement 24)

All changes are content/CSS-only, no new tokens:

- Hero `<h2>`/`.lead` copy shortened in-place (static markup, no script change).
- Footer `.ft` paragraph shortened but keeps the three warnings mandated by Req 16.3 (hours/prices/entry-rules change often; Unverified/Check-hours needs a call; alcohol for adults only) — condensed to one sentence each rather than removed.
- `pill()` helper: remove the `'<span class="pl ok">Looks open</span>'` branch entirely (Req 24.2):
  ```js
  const pill = x => (x.ty?`<span class="pl">${TY[x.ty]}</span>`:'')
    + (x.u?`<span class="pl wa">${x.ty?'Check hours':'Unverified'}</span>`:'')
    + (x.mt?'<span class="pl">Hill trip</span>':'')
    + (x.ph===2?'<span class="pl bd">Strenuous</span>':'');
  ```
  Non-unverified entries now simply show no status pill (plus type/Hill-trip/Strenuous pills where applicable), which is a strict subset of the current markup — no HTML structure elsewhere depends on the "Looks open" pill being present.
- `.by p` gets `display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden` (currently `.mini p` already does 3-line clamp; this extends 2-line clamping to the main `.by p` note text per Req 24.3). The existing `-webkit-line-clamp` usage in `.mini p` establishes the pattern; this is the same technique applied one level up.
- Spacing: reduce `.hd{margin-bottom:20px}` and `.hero{padding:4px 0 18px}` / the `@media(min-width:900px){.hero{padding:8px 0 24px}}` values modestly (e.g. to `16px` / `2px 0 14px` / `6px 0 18px`) and `.grid{gap:20px}` → `16px` (28px → 22px at desktop). These are token-value tweaks only; the radii (12/16/24), the pressed-edge `.go` button shadow (`0 2.5px 0 var(--edge),0 3px 8px var(--glow)`), the accent `#AD5CFF`, and both font families are untouched, satisfying "preserving the official UI tokens."

### 6. Summary_Tiles gating (Requirement 23)

`barH()` is unchanged as a pure formatter. The call sites in `eve()` and `run()` are wrapped so the tiles markup is only emitted when `tuned` is true:

```js
let h = tuned ? barH(du(use), fm(ret), dm!=='none'?'Back by':'Free until') : '';
h += W.join('');
```

Everything downstream (`tline`, `row`, warnings) is emitted regardless of `tuned` — only the three-tile bar is gated, per Req 23.1/23.2 which scope the hide/show specifically to Summary_Tiles. The daylight warning referenced in the task description ("gates … the daylight warning") is **not** gated by `tuned`: Req 11.2 says the daylight notice fires unconditionally whenever a Mountain_Trip stop is in the plan, with no `Tuned_State` precondition in Requirements. To avoid silently dropping a safety-relevant notice the user never asked to suppress, this design keeps the daylight warning (`W` array entries) rendering independent of `tuned`, and only gates the numeric tiles bar itself. This is flagged explicitly here as a deviation from the task description's wording in favor of the written requirements — if the intent was in fact to gate the warning too, that's a one-line change (`if (tuned && ...) W.push(...)`) to revisit with the user before implementation closes.

### 7. Baseline logic formally specified (already-implemented behavior)

These exist in the shipped script today; this section documents them against requirement IDs so the design is a complete map of the file, and calls out the one real bug fix among them.

**Hard filters (Req 4)** — inside `run()`'s `for (const d of D)` loop: Mountain_Trip excluded when `tr==='none'`; `far:1` excluded when `tr==='none' || dm!=='none'`; `ph===2` excluded when `gr!=='fr'`; Mountain_Trip/`far` excluded on `bike` when `gr!=='fr'`; `onroute` entries always skipped from the primary loop (`if(d.onroute)continue`); budget filter `st+need>cap` where `cap` is `min(ret,SUN)` for Mountain_Trip entries and `ret` otherwise; closing-time filter `d.c && st+tv+30>d.c`; opening-wait filter `wait>120`. No code change needed; carried forward as-is.

**Scoring model (Req 5)** — the `sc` formula already combines vibe-match ratio (`it`), time-budget fit (`fit`), travel suitability (`trn`), group suitability (`grp_`), the fixed `d.le` weight, time-of-day (`tod`), a Mountain_Trip risk penalty (`risk`), a budget-overrun penalty (`rr`), and an opening-wait penalty (`wait?-.05:0`), then clamped with `Math.max(0, …)`. `C.sort((a,b)=>b.sc-a.sc)` performs the descending sort. No code change needed.

**Itinerary assembly and trimming (Req 6)** — `S` is built by picking at most one Mountain_Trip-or-Full_Day_Trip candidate (`C.find(x=>x.mt&&!x.u)||C.find(x=>x.full&&!x.u)`), short-circuiting further additions when it's `full`, then filling up to 4 total stops. `ord()` sorts Mountain_Trip/Full_Day_Trip first, on-route second, then by opening time. `sim()` computes arrival/wait/departure sequentially. The `while(...)` trimming loop drops the lowest-scoring non-protected (`!x.mt&&!x.full`) stop and re-simulates until the finish time fits `ret` (or `SUN` when a Mountain_Trip stop is present). The `ok` flag and the "best single options" fallback (Req 6.7) are the existing `else` branch. No code change needed.

**On-route Maggi inclusion — operator-precedence fix (Req 7)**: the baseline line is

```js
if(mt&&mt.mt&&tr!=='none'&&sel.some(s=>mx.tg.includes(s)||!sel.length))
```

`sel.some(s=>mx.tg.includes(s)||!sel.length)` is semantically correct but misleadingly written: when `sel.length===0`, `sel.some(...)` is unconditionally `false` regardless of the `||!sel.length` clause inside the callback, because `Array.prototype.some` never invokes its callback on an empty array — so the "no vibe selected → include anyway" branch (Req 7.1) currently can never actually fire through this expression; it only happens to look like it handles that case. Req 7.3 requires the two conditions (no vibe selected vs. vibe match) to be independent, non-short-circuited OR'd checks. The fix pulls the empty-selection check out of the `.some()` callback entirely:

```js
if (mt && mt.mt && tr!=='none' && (!sel.length || sel.some(s=>mx.tg.includes(s))))
  S.push({...mx, du:20, m:mx.tg.filter(t=>sel.includes(t)), sc:.5});
```

Now `!sel.length` (Req 7.1) and `sel.some(...)` (Req 7.2) are two independently evaluated, top-level OR operands, matching Req 7.3's wording precisely. This is the one correctness bug fix identified among the "baseline" behaviors and is called out as such for the test suite (a dedicated golden test: zero vibes selected + Mountain_Trip stop + non-walk travel ⇒ Maggi stop present).

**Lunch stop addition (Req 8)** — `if(use>=300&&(!mt||!mt.full))` block adds one `pickE(['food','cafe'],...)` candidate with `sc:.4`, which is low enough to be the first dropped by the Req 6.6 trimming loop (consistent with open question #6 — lunch has no special trim-priority beyond its score, and this design does not add one, per the instruction not to resolve open questions with invented decisions).

**Return-deadline formulas (Req 9, 10)** — `dm==='none'` ⇒ `ret=dt`; `dm==='train'` ⇒ `ret=dt-45-45-20`; `dm==='flight'` ⇒ the corrected formula in section 2 above.

**Daylight cutoff (Req 11)** — `SUN=1020` constant; Mountain_Trip budget filter uses `cap=Math.min(ret,SUN)`; the trimming loop's `while` condition also re-checks against `Math.min(ret,SUN)` when a Mountain_Trip stop remains; the "off the mountain by 5 PM" notice (`r.out.some(o=>o.x.mt)`) and the Landour-specific tip (`lt.e>630`... — note: baseline compares against minute 630 which is 10:30 AM, matching Req 11.3's "after 10:30 AM" wording) are existing `W.push(...)` lines, unchanged.

**Group exclusions (Req 12)** — `ph===2` filtered for non-`fr` groups (also listed under Req 4.3); `pickE`'s `!(gr!=='fr'&&/bar|club/.test(x.ty))` filter excludes bar/club from both plan and rails for non-`fr` groups; the family-group "Night out" notice is the existing `sel.includes('night')` conditional `W.push`.

**Travel-mode guidance (Req 13)** — `stp()`'s `tr==='none'&&x.rt!=='walk'` branch appends the cab-booking guidance; the `x.mt&&tr==='bike'` branch appends the daylight/headlights/fuel guidance; the flight+bike luggage notice is an existing `W.push` keyed on `dm==='flight'&&tr==='bike'`.

**Evening assembly and safety guidance (Req 14, 15)** — `eve()`'s `add(...)` calls build cafe→dinner→(bar/club) in order, gated by `st<=1110` for the pre-dinner café and `night=sel.includes('night')&&gr==='fr'` for the nightlife stop starting `Math.max(1230,t)` (8:30 PM floor); the `dt-st<90` guard produces the Req 14.4 notice via `fail()`; `!P.length` produces the Req 14.5 notice; the `night` ternary in the warnings block produces the Req 15.1 safety copy, and the `sel.includes('night')` / else branches produce the Req 15.2 prompt and the family-exclusion notice.

**Unverified badges (Req 16)** — `pill()`'s `x.u` branch (after the Req 24.2 "Looks open" removal above) renders `Check hours` when `x.ty` is set (eatery) or `Unverified` otherwise (place); the footer `.ft` paragraph (shortened per Req 24.4) retains the three mandated warnings.

**Directions panels (Req 17)** — `stp(x,tr)` looks up `R[rt]` fragments by the entry's `rt` key(s), appends conditional mountain/no-vehicle guidance steps, and renders nothing (`''`) when there are zero steps, so `hw()`/`stp()` naturally omit the `<details>` element for entries without an `rt` (Req 17.3); `go(x)` always renders the external Google Maps search link (Req 17.2) regardless of `rt`.

**Image convention (Req 19)** — `IMG=q.get('img')||'img/'` and `art(x)` building `<img src="${IMG}${x.id}.jpg" ... onerror="this.remove()">` behind the generated SVG/gradient art, so a missing image never breaks layout (Req 19.2) and no code change is needed to add new images at the conventional path (Req 19.3).

**Embeddability (Req 20)** — `embed=1` or `top!==self` toggles `.emb` (hides `.hd`); `theme=light|dark` swaps the root class; `transparent=1` toggles `.tr`; `send()` posts `{scd:'h', h:H.scrollHeight}` on every `show()` call and via a `ResizeObserver` on `document.body`, matching Req 20.4's "whenever rendered height changes."

## Data Models

No schema changes beyond the `E` table edits in section 3. For completeness, the two catalog shapes stay exactly as today:

**Place_Catalog entry (`D[i]`)**
| field | type | meaning |
|---|---|---|
| `id` | string | stable key, also the image filename stem |
| `rt` | string? | key into `R` for direction steps |
| `n` | string | display name |
| `tg` | string[] | vibe tags matched against `IN` |
| `tv` | number | one-way travel minutes from campus |
| `du` | number | typical stay minutes |
| `o`,`c` | number? | open/close, minutes-of-day |
| `ph` | 0\|1\|2 | physical difficulty |
| `le` | number | fixed local-expert weight (0–1) |
| `mt`,`full`,`far`,`onroute`,`u` | boolean flags | Mountain_Trip / Full_Day_Trip / far-away / on-route-only / unverified |
| `hr` | string | human-readable hours note |
| `note` | string | description |
| `fx`,`tip` | string? | caveat / timing tip shown conditionally |

**Eatery_Catalog entry (`E[i]`)**: same shape minus `o/c/ph/full/far/mt/onroute`, plus `ty: 'cafe'|'food'|'bar'|'club'`.

## Correctness Properties

These are the invariants the implementation must hold for all valid inputs, not just the specific worked examples above. They are written to be checkable by property-based tests (randomized `st`/`dm`/`dt`/`tr`/`gr`/`pc`/vibe-selection inputs feeding `run()`/`eve()`) as well as by the golden tests in Testing Strategy; a property-based layer is the right tool here because the engine is a pure function of its inputs with no DOM/network dependency, so it can be fuzzed cheaply.

### Property 1: Return_Deadline consistency

**Validates: Requirements 9, 10**

For any `dm`/`dt` (Req 9, 10), the computed `ret` always equals exactly one of: `dt` (`dm==='none'`), `dt-45-45-20` (`dm==='train'`), or `dt-(pk(dt-120)?150:120)-75-20` (`dm==='flight'`) — there is no fourth code path and no input for which `ret` falls outside these three formulas.

### Property 2: Peak-window argument

**Validates: Requirements 10.2**

`pk(...)` is never invoked with the raw flight departure time `dt` to gate the Return_Deadline calculation (Req 10.2, bug fix); it is only ever invoked with the airport-arrival candidate `dt-120`. For any `dt`, swapping in `pk(dt)` instead of `pk(dt-120)` must change the result for at least one value in each Peak_Window boundary region, confirming the two call sites are not equivalent.

### Property 3: Mountain_Trip daylight bound

**Validates: Requirements 4.6, 11**

For every produced itinerary (Req 4.6, 11), if a stop has `mt:1`, that stop's `arrival + 30` never exceeds `Math.min(Return_Deadline, 1020)` (the Daylight_Cutoff). This holds both at candidate-filtering time and after the Req 6.6 trimming loop converges — trimming must never leave a Mountain_Trip stop violating the bound it was supposed to enforce.

### Property 4: At most one Mountain_Trip/Full_Day_Trip stop

**Validates: Requirements 6.1, 6.2**

For every produced itinerary (Req 6.1, 6.2), the count of stops with `mt:1 || full:1` is 0 or 1. WHEN that one stop has `full:1`, the total stop count for the plan is exactly 1 (no sightseeing, lunch, or Maggi stop is appended alongside it).

### Property 5: Itinerary finishes within deadline

**Validates: Requirements 6.6**

For every non-fallback plan the engine returns (Req 6.6), the simulated finish time of the last stop's return-to-campus leg never exceeds `ret` (or `Math.min(ret,1020)` when a Mountain_Trip stop is present). If no subset satisfies this, the engine must take the Req 6.7 fallback path (best single-stop options) rather than return a plan that violates the bound.

### Property 6: Score non-negativity

**Validates: Requirements 5.2**

For every candidate scored by `sc` (Req 5.2), across all input combinations, the final clamped score is `>= 0`; the pre-clamp weighted sum may go negative, but no negative value ever reaches the sort/trim/render stages.

### Property 7: Maggi inclusion is a true independent OR

**Validates: Requirements 7.3**

For all `sel` (vibe selection) and all Maggi tag sets (Req 7.3), the inclusion predicate `!sel.length || sel.some(s=>mx.tg.includes(s))` evaluates to `true` whenever `sel.length===0`, regardless of whether `mx.tg` and `sel` overlap (vacuously, since `sel` is empty) — i.e. the empty-selection branch must never depend on `.some()` being invoked on an empty array to produce the "include anyway" result. Equivalently: the predicate's truth value when `sel.length===0` must be `true` for every possible `mx.tg`.

### Property 8: No bar/club leakage for family groups

**Validates: Requirements 12.2**

For every `gr !== 'fr'` (Req 12.2), the rendered plan and the rendered suggestion rail together contain zero Eatery_Catalog entries with `ty==='bar'` or `ty==='club'`, for any vibe selection including "Night out".

### Property 9: No fabricated facts for unverified entries

**Validates: Requirements 16.2, 18.5, 18.6**

For every entry with `u:1` (Req 16.2, 18.5, 18.6), the rendered output never shows a concrete hours/price/address string sourced from a non-placeholder field — only `hr` values equal to (or containing) the literal "Check hours" / "Check address and hours" placeholder text, plus the `Unverified`/`Check hours` pill, ever render for that entry. This must hold for `rdr`, `koi`, and `hig` specifically as well as for any entry generically flagged `u:1`.

### Property 10: Summary_Tiles visibility matches Tuned_State

**Validates: Requirements 23.1, 23.2**

For every render (Req 23.1, 23.2), the `.bar` markup is present in `#out` if and only if `tuned === true` at the time `show()` is called; there is no render where `tuned` is true and `.bar` is absent, or `tuned` is false and `.bar` is present.

### Property 11: Tuned_State resets on mode change

**Validates: Requirements 23.3**

Immediately after any `input[name=md]` change event fires (Req 23.3), `tuned === false`, regardless of what `tuned` was immediately before the event, and regardless of which mode was selected.

### Property 12: No horizontal overflow at supported widths

**Validates: Requirements 22**

For every viewport width `>= 900px` (Req 22) (and down through the phone-first range below it), `document.documentElement.scrollWidth <= window.innerWidth` after layout settles, for any combination of control-panel inputs (longest-copy entries, 3-tile Summary_Tiles bar, maximum-length venue names all included).

## Error Handling

| Operation | Failure condition | Recoverable? | What the guest/caller sees | Logged? |
|---|---|---|---|---|
| `run()` day-window check (`use<=0`) | start time at/after Return_Deadline | Recoverable — guest can change inputs | `fail()` renders a `.pn` notice: "Your start time is after the time you need to be back (…). Try starting earlier." | No console logging (none exists today; not introduced — a client-side single-page tool with no backend has no log sink to write to) |
| `run()` no candidates survive filters | overly restrictive travel/group/time combo | Recoverable | `fail()`: "Nothing fits this window with your travel choice. Try starting earlier, allowing more time, or picking a car / cab." | No |
| `run()` no combination fits `ret` | every subset still overruns after trimming to 1 stop | Recoverable | Falls back to showing best single-stop options with a `.wn` notice instead of a `fail()` hard-stop (plan degrades gracefully rather than erroring) | No |
| `eve()` window `<90` min | `dt-st<90` | Recoverable | `fail()`: "Give yourself at least 90 minutes…" | No |
| `eve()` no stops fit | `!P.length` | Recoverable | `fail()`: "Nothing fits this evening…" | No |
| Image load (`<img onerror>`) | photo missing or 404 at `img/<id>.jpg` | Recoverable, silent | `this.remove()` — element removed, generated art/gradient shows underneath; guest sees no error | No (deliberately silent; broken images are expected/common before the owner supplies the ~28-photo set) |
| `postMessage` to parent frame | parent page has no listener, or page is not actually embedded | Non-fatal no-op | Nothing visible; `top!==self` check only gates the `.emb` class, the `postMessage` call itself is safe to call even when not embedded (`'*'` target, no response expected) | No |
| Malformed/out-of-range time inputs (e.g. `dt` before `st` in day mode) | guest sets implausible times | Recoverable | Caught by the `use<=0` check above, same `fail()` path — not a distinct error path | No |

There is no persistence layer, no network request beyond font/icon loading (which degrade to system fonts/no icons on failure, both acceptable per Req 21.5's "no build step" / single-file constraint — no explicit fallback is specified beyond the browser's own font-fallback stack, consistent with not inventing requirements not stated). All "errors" in this feature are **user-input-infeasibility** states handled by rendering a notice, never a thrown exception surfaced to the guest; this matches the existing `fail()` pattern and is extended, not replaced, by this design.

## Testing Strategy

The project has no existing test harness or `package.json` in the repository today (confirmed: `.kiro/specs/scd-explore-doon/` contains only `requirements.md` and `.config.kiro`, and the workspace root has only the HTML file). This design keeps verification lightweight and dependency-minimal, consistent with "single file, no build step": a small Node + jsdom smoke-test script, run manually (e.g. `node test/smoke.mjs`) and not wired into any CI the project doesn't have.

**Unit-testable (pure functions, no DOM)**: `tm`, `fm`, `du`, `pk` (both before/after the fix), `barH`'s string output shape, and the scoring arithmetic can be exercised by extracting the relevant expressions into a small test harness that evaluates them with fixed inputs — these don't require loading the page at all.

**Integration-tested via jsdom** (the existing informal approach, continued): load `scd-explore-doon.html` into a jsdom document, dispatch synthetic `change` events on the control inputs to simulate guest interaction, then assert on the rendered `#out` DOM:

- *Stop-count assertions*: e.g. selecting `tr=none` and asserting zero `mt:1`-sourced cards appear; selecting `gr=kid` and asserting zero `.pl.bd` ("Strenuous") pills render.
- *Absence of thrown errors*: capture `window.onerror`/unhandled rejections during each scripted interaction sequence; the suite fails if any fires, since every requirement path is specified above to render a `.pn`/`.wn` notice instead of throwing.
- *Golden-test updates required by this design*:
  1. **Peak-window fix**: set `dm=flight`, `dt=20:00`, assert the rendered "Back by" tile (once `tuned`) reads `3:55 PM` (minute 955), replacing/adding to whatever golden value the old buggy `pk(dt)` call previously produced for this input. This directly encodes Req 10.5.
  2. **Maggi no-vibe fix**: `tr=car`, zero vibes checked, a Mountain_Trip-eligible day-mode window; assert the Maggi stop (`id==='maggi'`) card is present in the rendered itinerary. Add a second case with one matching vibe selected, and a third case with vibes selected that do *not* match the Maggi tags, asserting it still appears only in the no-vibe and vibe-match cases, not in the mismatch case — covering Req 7.1/7.2/7.3 as independent branches.
  3. **Tuned-state visibility**: on initial load (no interaction), assert `.bar` (Summary_Tiles) is absent from `#out`; dispatch one `change` event on `#st` with a non-default value, assert `.bar` is now present; dispatch a mode-change event, assert `.bar` is absent again (Req 23.1–23.3).
  4. **Overflow checks**: using jsdom's layout limitations in mind (jsdom does not compute real layout/scrollWidth), this check is better done as a manual/CDP-based visual check — set the jsdom/Playwright viewport (if Playwright is available; otherwise a manual browser check) to 1280px, 1440px, and 1920px widths and assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. Flagged here as a check that may need a real browser engine (Playwright/Puppeteer) rather than jsdom, since jsdom does not perform CSS Grid layout; if no browser-automation dependency is desired, this becomes a manual pre-release check instead, which should be stated plainly to the user rather than claimed as automated when it isn't.
  5. **Catalog corrections**: assert `E` no longer contains an entry with `n==='Kalsang Ama Café'`/`id==='mlc'`/`id==='ycf'`, does contain `n==='AMA Café'` and `n==='The Highland Bakehouse & Pizzeria'`, and that `rdr`/`koi` still render their `Check hours` badge.

**What stays manual / out of automated scope**: real device embedding against `https://awssbggeu.com/student-community-day` (cross-origin `postMessage` sizing can only be fully verified against the live parent page), actual font loading from Google Fonts, and genuine visual review of the 2-line clamp and shortened copy at small phone widths. These are noted as manual pre-launch checks, not gaps the automated suite claims to cover.

## Open Questions Carried Forward From Requirements

These are **not resolved** by this design — they are implementation placeholders, matching `requirements.md`'s "Open Questions / Known Limitations" section, and this design deliberately avoids inventing values for them:

1. **The Highland Bakehouse & Pizzeria** — only the display name is corrected now; real address/hours/price/tags remain pending from the owner and the entry keeps its `u:1` Unverified_Badge until supplied (Req 18.4).
2. **Readers Coffee House** — real address/hours from https://readerscoffeehouse.in/ have not been fetched; entry unchanged, keeps `Check hours` (Req 18.5).
3. **"Koi" venue** — no verified details supplied; entry unchanged, keeps `Check hours` (Req 18.6).
4. **~28-item image filename list** — the `img/<id>.jpg` convention (Req 19) is implemented/documented generically; no concrete filename list exists to validate against yet, so there is nothing further for this design to specify.
5. **City-to-city flat 25-minute travel-leg estimate** — unchanged; no refinement is specified since no decision was made to change it.
6. **Lunch-stop trim priority on relaxed-pace Mountain_Trip days** — the lunch stop keeps its existing `sc:.4` with no special trim-order protection; this design does not add trim-priority weighting for it, consistent with the requirement explicitly leaving this undecided.

Any future implementation step that touches items 1–3 must come from the owner-supplied real data, not from this design or from the implementer's inference.
