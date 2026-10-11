# Explore Doon — visual/interaction refresh implementation notes

Scope: pure presentation/UX/interaction polish of `scd-explore-doon.html` only. No engine logic
(filters, scoring, itinerary assembly, return-deadline math, evening-mode assembly) was touched.
This is the first iteration — no `.agents/tasks/explore-doon-review.json` existed when this work
started.

## Design choices made

- **New CSS custom properties** (additive, no existing tokens renamed/removed): `--dur: .55s`
  (scroll-reveal transition duration), `--dur-f: .2s` (fast micro-interaction duration),
  `--ease: cubic-bezier(.16,1,.3,1)` (decelerate-style ease for reveals/entrances), `--ease-out:
  cubic-bezier(.4,0,.2,1)` (standard material-style ease for hover/press feedback). Accent
  `#AD5CFF`, its derived `--ac/--edge/--glow/--t15/--t20/--t30` tokens, and both font families are
  untouched.
- **Scroll-reveal mechanism**: a `data-r` attribute (not a class) marks elements that start at
  `opacity:0; transform:translateY(18px)`. A single `IntersectionObserver` (per design — vanilla
  JS, no library) created once in the script, with `rootMargin:'0px 0px -8% 0px'` and
  `threshold:.12`, sets `data-r="in"` the first time an element scrolls into view and then
  unobserves it (one-shot reveal, not a flicker-on-every-scroll effect). A `reveal()` helper runs
  after every `show()` call (i.e. every itinerary re-render) so newly-rendered stop/mini cards and
  the Summary_Tiles bar get the same treatment as the first paint.
  - Elements wired with `data-r`: each itinerary stop card (`stop()` → `.cd[data-r]`), each
    suggestion-rail mini card (`mini()` → `.cd.mini[data-r]`), and the Summary_Tiles bar
    (`barH()` → `.bar[data-r]`).
  - The control panel (`.ctl`) and header/hero were deliberately **not** put behind scroll-reveal:
    they are above the fold and the primary interactive surface, so hiding them pending a scroll
    event would create a flash-of-invisible-controls on load. They instead get a one-off CSS
    `fade-up` keyframe entrance animation on initial paint (see below), which satisfies the "hero
    entrance" ask without gating interactivity on IntersectionObserver timing.
- **Reduced-motion compliance**: the existing `@media(prefers-reduced-motion:reduce){*{transition:
  none!important;animation:none!important}...}` block (already a no-op blanket override for all
  transitions/animations) was extended with one additional rule:
  `[data-r]{opacity:1!important;transform:none!important}`. This is necessary because the
  blanket `transition:none!important` alone would otherwise leave reveal-pending elements stuck at
  `opacity:0` forever (the transition that was supposed to fade them in is disabled, but the
  *base* hidden state from `[data-r]` is a static rule, not a transition, so it needs its own
  override). The script layer also checks `matchMedia('(prefers-reduced-motion: reduce)').matches`
  before even constructing the `IntersectionObserver`; when reduced motion is active, `io` is
  `null` and `reveal()` sets `data-r="in"` on every element synchronously and immediately, so
  content is simply visible with no observer, no transition, and no delay.
- **Micro-interactions added** (all transform/opacity/color/shadow based, all using
  `--dur-f`/`--ease-out`, all covered by the blanket reduced-motion override):
  - Theme toggle button (`.ib`): hover tints to the accent + lifts 1px; active presses down 1px.
  - Segmented controls (mode/travel/group/pace) and vibe chips: hover tint on unselected options,
    active-press scale (`scale(.97)`), existing checked-state visuals (background/border/box-shadow)
    untouched — selection state is still conveyed by a static, non-animated visual difference per
    the accessibility requirement, animation is only added on top of hover/press, not as the
    selection signal itself.
  - Place/eatery cards (`.cd`): hover lift (`translateY(-3px)`) + soft shadow + border tint.
  - `.go` Directions button: **extended** the existing pressed-edge shadow pattern rather than
    replacing it — hover now also brightens the glow shadow slightly and lifts 1px; the existing
    `:active{transform:translateY(2px)}` press behavior is preserved, just paired with a matching
    shadow compression on press.
  - Fine-tune `<details>` summary and each stop's "How to get there" `<details>` summary: subtle
    color/opacity hover feedback.
  - Summary tiles (`.tl`): added a transition property so any future transform change is smooth
    (no behavior change otherwise).
- **Re-render transition**: itinerary re-renders already replace `#out`'s `innerHTML` wholesale
  (`show()`); rather than adding a competing animation layer on top of that swap, the freshly
  inserted stop/mini/bar nodes are exactly the `data-r` elements described above, so every
  re-render gets the same fade+translate-up reveal as first paint, scoped per new element (not a
  blanket fade of the whole panel, which would feel like a flash on every control tweak).
  Warning banners (`.wn`) get a lightweight one-shot `fade-up` keyframe (not scroll-gated, since
  they're contextual notices that should appear immediately) instead of being left static.
- **Hero/header entrance**: `.hero` and `.hd` each get a one-shot `fade-up` keyframe animation on
  load (`animation:fade-up .6s/.5s var(--ease) both`), subject to the same blanket reduced-motion
  override. `.pn` (the control panel) also gets this same subtle entrance so the whole first paint
  feels coordinated.
- **`.rail` carousel**: left as the existing horizontal `overflow-x:auto` scroller inside its own
  grid column (untouched behaviorally); added `scroll-padding:0 16px` so snap-scrolling respects
  the rail's own edge padding — a visual polish only, no structural change.
- **Hard guards for the embed/jsdom environment**: the script checks `typeof IntersectionObserver
  !== 'undefined'` and `typeof matchMedia === 'function'` before using either, falling back to
  "reveal immediately" when absent (this matters because the project's own jsdom test harness has
  neither API polyfilled, and this fallback is what keeps `node test/smoke.mjs` passing without
  modifying the test file).

## Files touched

- `scd-explore-doon.html` — CSS additions (new custom properties, hover/active/focus states,
  scroll-reveal rules, reduced-motion extension) and one small JS addition (the `reveal()` /
  `IntersectionObserver` wiring plus a `reveal()` call inside the existing `show()` function). No
  element IDs changed. No `D`/`E` catalog data changed. No engine function (`run`, `eve`, `pk`,
  scoring, trimming, `pickE`, etc.) changed.
- `test/smoke.mjs` — **not modified**. No selector/markup rename was needed; the new `data-r`
  attribute and new CSS classes do not touch anything the test file queries by id/class text.

## Verification performed

1. **`node test/smoke.mjs`** — ran repeatedly after each incremental change and once more after
   the final cleanup pass. All 7 assertions pass unchanged and unweakened:
   - `smoke: OK` (page loads, inline script executes, `#out` renders, no thrown errors)
   - `golden (8.1)` flight peak-window Return_Deadline → "Back by 3:55 PM"
   - `golden (8.2a/b/c)` Maggi on-route inclusion (no-vibe / matching-vibe / non-matching-vibe)
   - `golden (8.3)` Summary_Tiles `.bar` visibility tied to `Tuned_State`, including the
     mode-change reset
   - `golden (8.4)` catalog corrections (ama/hig renamed, mlc/ycf removed, rdr/koi placeholders
     intact)
   This directly confirms the engine's filtering/scoring/assembly/return-deadline/evening-mode
   behavior is byte-identical to before the UI pass, since these assertions inspect the *rendered*
   output of `run()`/`eve()`.
2. **Reduced-motion**: confirmed by code inspection that the single
   `@media(prefers-reduced-motion:reduce)` block (a) blanket-disables every `transition`/
   `animation` declaration added in this pass (they are all plain `transition`/`animation`
   properties, none use `!important` themselves, so the blanket `!important` override wins), and
   (b) additionally forces `[data-r]{opacity:1!important;transform:none!important}` so
   scroll-reveal-pending content can't get stuck invisible once its transition is disabled. Could
   not be verified headlessly (jsdom does not evaluate `@media` query blocks against layout), so
   this is a static-reasoning check, not an automated one — same limitation the project's existing
   design.md documents for CSS Grid/overflow checks.
3. **Horizontal overflow at 375 / 768 / 1280 / 1920px**: verified by static CSS reasoning, since
   jsdom (used by the only test harness in this repo) does not perform real CSS Grid/layout and no
   browser-automation dependency (e.g. Playwright) is available or in scope to add. All new rules
   use `transform`/`opacity`/`box-shadow`/`color`/`background` — none change `width`, `margin`,
   `padding`, or introduce new fixed-width elements, and the pre-existing overflow safety nets
   (`html{overflow-x:hidden}`, `.grid{grid-template-columns:380px minmax(0,1fr)}`, `#out{min-width:
   0}`, `.bar{grid-template-columns:repeat(3,minmax(0,1fr))}`) are all untouched. The only hover
   transforms that could theoretically affect a bounding box (`translateY(-3px)` lift on `.cd:hover`,
   `translateY(-1px)` on buttons) are `transform`-based, which do not participate in layout flow or
   reflow siblings, so they cannot introduce page-level horizontal scroll at any viewport width.
   This was not verified in an actual browser (no browser automation tool available in this
   environment) — flagged explicitly as unverified-headlessly per the task's own acknowledgment
   that this check is manual/visual in design.md's Testing Strategy.
4. **Control panel re-render on input change**: confirmed via the passing `golden (8.1)`/`(8.2)`/
   `(8.3)` assertions above, which each dispatch synthetic `change` events and assert the
   re-rendered `#out` content reflects the new state — the 40ms debounce dispatcher
   (`document.addEventListener('change', ...)`) was not modified.
5. **`embed=1` / `theme=` / `transparent=1` params**: confirmed unchanged by direct inspection —
   none of the lines handling `q.get('embed')`, `q.get('theme')`, `q.get('transparent')`, the
   `.emb`/`.tr`/`.light`/`.dark` class toggles, or the `ResizeObserver`/`postMessage` `send()`
   pattern were edited. The new `reveal()` call was deliberately placed inside `show()` (which
   already calls `send()` right after mutating `#out.innerHTML`) rather than wired into a second
   observer or timer, specifically so it adds no additional `postMessage` traffic — `reveal()` only
   toggles a `data-r` attribute (and, when IntersectionObserver is available, hands elements to an
   observer which does its own internal, independent book-keeping); it never itself changes
   `document.body`'s box size, so it cannot cause extra `ResizeObserver`-triggered `send()` calls
   beyond the ones the content swap itself would already produce.

## Known limitation

Real-browser confirmation of (a) the scroll-reveal visually firing correctly as cards enter the
viewport, and (b) absence of horizontal scroll at the four target viewport widths, was not
performed — this environment has no browser-automation tool available. The static-reasoning
checks above are offered in its place, consistent with how design.md already treats CSS
Grid/layout correctness as a manual check outside this project's jsdom-only test harness.
