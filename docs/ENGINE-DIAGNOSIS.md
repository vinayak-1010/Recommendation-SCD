# Engine Diagnosis & Root Cause Analysis

**Project:** Explore Doon × Mussoorie (AWS Student Community Day 2026 · Graphic Era Deemed to be University)  
**Date:** October 2026  
**Status:** Phase 0 Diagnostic Report  

---

## 1. Executive Summary

Static code inspection and empirical execution of `scd-explore-doon.html` were conducted against hypotheses RC1–RC13 outlined in Section 3 of the Master Prompt. **All 13 suspected root causes were confirmed.**

The current implementation is a monolithic script combining static UI markup, hardcoded data tables (`D`, `E`, `R`), and a heuristic-based greedy timeline assembler. While functional for isolated golden scenarios, it exhibits severe structural and geographic failure modes when general inputs are varied.

---

## 2. Root Cause Analysis & Reproduction Results

| Hypothesis | Status | Empirical Finding / Reproduction Evidence | Required Architecture Fix |
|---|---|---|---|
| **RC1: No geography** | **CONFIRMED** | `leg(a, b)` uses arbitrary constants (`25`, `45`, `a.tv*0.9`, `b.tv*0.5 + 10`). No place-to-place or cluster-to-cluster distance/duration matrix exists. | Implement precomputed O-D matrix (`routes.json`) covering all cluster and place pairs with mode-specific `freeFlowMin` and directional distinctions (`up` vs `down`). |
| **RC2: Independent selection + greedy fill** | **CONFIRMED** | For inputs `sel=['nature','views','food'], tr='car', 08:00–17:00`, the engine selects: **Landour** (top of mountain) → **Maggi stop** (hillside) → **Mindrolling Monastery** (Clement Town, base of valley). The engine never evaluates total route coherence or backtracking. | Beam-search candidate evaluation comparing complete itineraries using an objective scoring function penalizing travel time, detour, and backtracking. |
| **RC3: Tag overlap inflates scores** | **CONFIRMED** | Score formula uses `it = m.length / sel.length`. Places with high tag counts (e.g. Landour with 4 tags: `food, views, nature, history`) systematically monopolize slots across diverse user queries. | Replace tag fraction with per-interest affinity matrices with max-credit capping (marginal value diminishing after 1st matching stop). |
| **RC4: Maggi stop is a hack** | **CONFIRMED** | `onroute` place is inserted whenever tags intersect or `sel` is empty, then sorted via `ord()` after mountain stops with a static 45-minute leg, despite physically lying on the ascent path. | Model directional on-route stops with explicit entry/exit route side and marginal detour penalty. |
| **RC5: Location-blind food engine** | **CONFIRMED** | `pickE()` filters solely by local-expert weight `le` and fixed 30-min travel time. Lunch is appended last without regard to where the preceding stop is located. | Treat meal stops as first-class timeline nodes positioned chronologically within standard meal windows (breakfast, lunch, snack, dinner) adjacent to previous stops. |
| **RC6: Unverified places silently excluded** | **CONFIRMED** | Line 268 explicitly checks `if (x.u) continue;`, completely skipping FRI, Robber's Cave, and Rishikesh from the main plan. Caveat text `fx` is defined on records but never rendered anywhere in the DOM. | Implement a formal verification schema (`verified`, `reported`, `estimated`, `unknown`) with UI badges and honest inclusion where appropriate. |
| **RC7: Traffic as scalar hack** | **CONFIRMED** | Static `SUN=1020` (5:00 PM) hardcoded cutoff. `tv` is a static constant for each place regardless of departure hour, day of week, or direction. `pk()` is only used for flight airport buffers. | Time-of-day × day-type × direction traffic model (`traffic.json`) with P50 scheduling and P80 deadline validation. |
| **RC8: Implicit return buffer** | **CONFIRMED** | Intermediate legs are neglected in `need = tv*2 + du`. Non-flight/train mode has zero explicit contingency buffer. | Explicit configurable contingency buffer calculation (`max(15, 10 + 12% driving) + hill buffers`). |
| **RC9: No alternatives concept** | **CONFIRMED** | "More ideas" is simply an unselected candidate slice from `C`, not swappable replacements with delta travel times. | First-class alternative generation (up to 2 per stop) with live `replan()` engine. |
| **RC10: Sunday hardcoded** | **CONFIRMED** | "Sunday" appears 9 times in template markup and script logic. There is no date selection or day-type differentiation. | Add Date picker / preset selector with dynamic day-type derivation and astronomical sunrise/sunset calculations. |
| **RC11: No-vehicle exclusion** | **CONFIRMED** | Line 250 has `if(d.mt && tr==='none') continue;`. Car and cab are conflated into `car`. Visitors without vehicles are blocked from Mussoorie. | Distinct modes for Cab / Hired Taxi, Public / Shared Bus, Two-Wheeler, and Walk/Auto with estimated fares. |
| **RC12: Conflated interests** | **CONFIRMED** | UI groups "Food & cafés" as a single vibe. Master prompt requires distinct handling for Cafés, Food, Heritage, Chill, Adventure, Views, Spiritual, Nature. | Expand vibe taxonomy with fine-grained tags and single primary `experienceType` per venue. |
| **RC13: Monolithic maintainability** | **CONFIRMED** | 43 KB single file `scd-explore-doon.html`. Committed `node_modules/` in repo. Directory `scd images` contains a space. Images missing for several items. | Modularize into Vite + TypeScript static architecture with pure engine in `src/engine/`, data in `data/`, styles in `src/styles/`, and clean assets in `public/images/`. |

---

## 3. Conclusions & Next Steps

The engine requires a clean architectural separation:
1. Pure computational engine in TypeScript without DOM dependencies.
2. Structured JSON datasets (`data/places.json`, `data/routes.json`, `data/traffic.json`, `data/rules.json`, `data/config.json`) validated via automated linting.
3. Complete itinerary beam search with geographic coherence.
4. Comprehensive test harness with golden scenarios and fast-check properties.
