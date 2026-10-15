# Explore Doon Engine 2.0 · Changelog & Architectural Record

## Executive Summary

Explore Doon 2.0 replaces the legacy, greedy heuristic calculator with a production-grade, constraint-first recommendation engine designed specifically for attendees of AWS Student Community Day 2026 at Graphic Era Deemed to be University, Clement Town, Dehradun.

---

## 1. Root Causes Resolved (RC1 – RC13)

| Root Cause | Defect in Legacy 1.0 | Engine 2.0 Resolution |
| :--- | :--- | :--- |
| **RC1: Impossible Single-Window Plans** | Hardcoded 120-min estimate for Mussoorie from Clement Town regardless of traffic or mode. | Origin-Destination graph (`data/routes.json`) with mode-specific speeds and directional traffic multipliers (`data/traffic.json`). |
| **RC2: Disjoint Mountain Stops** | Top-score sorting picked stops on opposite hillsides (e.g. Landour + George Everest + FRI). | Coherent clustering (`data/clusters.json`) and transition cost penalties in beam search. |
| **RC3: Artificial Cluster Inflation** | Summing affinities across all venues caused clusters with 15 cafés to beat small hill clusters. | Diminishing cluster affinity: `topItem + 0.5 * secondItem`. |
| **RC4: Return Deadline Math** | Fixed 20-min return buffer caused missed flights during evening peak jams. | P80 traffic buffer + flight/train peak window detection (`pk(dt - 120)`). |
| **RC5: Maggi Operator Precedence** | `sel.some(s => mx.tg.includes(s) \|\| !sel.length)` failed when `sel` was empty. | Independent OR operand: `(!sel.length \|\| sel.some(...))`. |
| **RC6: Unverified Data Fabrication** | Readers Coffee House, Koi, and Highland Café had unverified badges mixed with assumed open states. | Strict verification schemas (`status: 'unverified'`), explicit field placeholders, and no fabricated hours or coordinates. |
| **RC7: Overcrowded Meal Injections** | Hardcoded meal intervals injected mid-day meals into short 90-minute windows. | Dynamic meal windows that scale visit durations down to `place.visit.min` and omit secondary meals in tight windows. |
| **RC8: Two-Wheeler Mountain Hazard** | Two-wheelers routed onto ghats after dark or in high-risk evening traffic. | Strict daylight calculator (`src/engine/daylight.ts`) enforcing mountain exit 45 min before astronomical sunset for two-wheelers. |
| **RC9: Non-Negative Score Violations** | Penalty terms could drive candidate scores negative, breaking ranking stability. | Normalized affine scoring functions clamped strictly to non-negative bounds `[0, 1]`. |
| **RC10: Missing Alternatives / Rigid Output** | Only one monolithic itinerary presented with no swappable stops. | Interactive `ReplanEngine` (`src/engine/replan.ts`) providing contextual alternatives with live timing updates. |
| **RC11: Family Group Bar/Nightclub Leakage** | Nightlife tags leaked into family-with-kids itineraries. | Strict suitability filter excluding bars and lounges when `group === 'family-kids'` or `'family-elders'`. |
| **RC12: Network Dependence for Maps** | Map rendering failed without an external API key or internet access. | Three-layer progressive map architecture: Layer 1 Google Maps deep links, Layer 2 on-demand embed, and Layer 3 keyless offline vector SVG. |
| **RC13: Monolithic Sprawl & No Single-File Build** | 43 KB single file became unmaintainable. | Modular TypeScript architecture with Vite build pipeline and automated `npm run build:single` generating self-contained bundles. |

---

## 2. Key Architectural Components

1. **Astronomical Solar Model (`src/engine/daylight.ts`):**
   Calculates exact sunrise, golden hour, sunset, and dusk for Graphic Era coordinates (30.2705° N, 77.9965° E) using NOAA solar formulas.

2. **Feasibility-First Beam Search (`src/engine/assembler.ts`):**
   Evaluates full path permutations rather than one greedy stop at a time. Trims secondary stops iteratively until P80 arrival strictly satisfies departure deadlines.

3. **Replan Engine (`src/engine/replan.ts`):**
   Powers 1-tap stop swapping, drop, lock, and start-time shifting with instant constraint verification.

4. **Offline PWA & Service Worker (`public/sw.js`):**
   Caches app shell and guide content so conference attendees never lose their plans in mountain dead zones.
