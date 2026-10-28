# Implementation Plan: Apple-Inspired Explore Doon Redesign

## Overview

This plan implements five focused improvements to the existing single-file `scd-explore-doon.html`: layout fixes for responsive overflow, a `tuned` state flag to gate summary tiles, corrected peak-window logic for flight return calculations, catalog data corrections, and minimal text/spacing refinements. All work stays within the existing inline architecture (single HTML file with inline `<style>` and `<script>` IIFE, no build step).

## Tasks

- [ ] 1. Fix responsive layout and prevent horizontal overflow
  - [ ] 1.1 Apply CSS grid minmax fixes for viewport constraint
    - Add `overflow-x:hidden` to `html` root
    - Change `.grid` template columns to `380px minmax(0,1fr)` at 900px+ breakpoint
    - Add `min-width:0` to `#out` element
    - Change `.bar` grid columns to `repeat(3,minmax(0,1fr))`
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [ ] 2. Implement tuned state and summary tiles gating
  - [ ] 2.1 Add tuned state flag and change detection logic
    - Declare `let tuned = false` in script scope
    - Define `DEFAULTS = {st:'08:00', dm:'none', dt:'17:00'}`
    - Extend delegated change listener to track changes away from defaults
    - Add tuned reset to mode change handlers
    - _Requirements: 3.5, 23.3_
  
  - [ ] 2.2 Gate Summary_Tiles rendering based on tuned state
    - Wrap `barH()` calls in run() and eve() with tuned checks
    - Ensure daylight warnings render independently of tuned state
    - _Requirements: 23.1, 23.2_

- [ ] 3. Fix peak-window calculation for flight return deadlines
  - [ ] 3.1 Correct pk() call to use airport-arrival time
    - Change `pk(dt)` to `pk(dt-120)` in flight return-deadline formula
    - Verify 8:00 PM flight produces 3:55 PM return deadline
    - _Requirements: 10.2, 10.5_

- [ ] 4. Apply catalog data corrections
  - [ ] 4.1 Update eatery catalog entries
    - Rename 'Kalsang Ama Café' to 'AMA Café' in E table
    - Remove 'Mussoorie Lights Café & Bar' (mlc) entry
    - Remove 'Y Café & Restaurant' (ycf) entry
    - Replace 'Highland Café' placeholder with 'The Highland Bakehouse & Pizzeria' (keep u:1 flag)
    - Retain rdr and koi entries unchanged with Check hours badges
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

- [ ] 5. Fix Maggi stop inclusion logic operator precedence
  - [ ] 5.1 Refactor on-route stop inclusion condition
    - Change `sel.some(s=>mx.tg.includes(s)||!sel.length)` to `(!sel.length || sel.some(s=>mx.tg.includes(s)))`
    - Ensure zero vibes selected + Mountain_Trip + non-walk travel includes Maggi stop
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 6. Apply minimal text and UI refinements
  - [ ] 6.1 Shorten hero and footer copy
    - Condense hero `<h2>` and `.lead` paragraph text
    - Reduce footer `.ft` text while preserving three mandatory warnings
    - _Requirements: 24.1, 24.4_
  
  - [ ] 6.2 Remove "Looks open" pill and apply spacing tweaks
    - Delete `'Looks open'` branch from `pill()` helper
    - Add 2-line clamp to `.by p` note text
    - Reduce `.hd` margin-bottom to 16px
    - Reduce `.hero` padding (4px 0 18px at mobile, 8px 0 24px at desktop)
    - Reduce `.grid` gap to 20px (22px at desktop)
    - _Requirements: 24.2, 24.3, 24.5_

- [ ] 7. Checkpoint - Verify layout, state, and data accuracy
  - Verify no horizontal overflow at 900px, 1280px, 1440px, 1920px viewports
  - Verify summary tiles hidden on initial load
  - Verify summary tiles appear after any fine-tune control change
  - Verify tuned state resets when switching between day/evening modes
  - Verify flight at 8:00 PM produces 3:55 PM return deadline
  - Verify Maggi stop included with zero vibes + Mountain_Trip + car travel
  - Verify catalog corrections: AMA Café renamed, mlc/ycf removed, Highland renamed
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Manual verification and visual review
  - [ ] 8.1 Test responsive behavior across breakpoints
    - Verify desktop two-column grid stays within viewport width
    - Verify mobile single-column layout flows correctly
    - Check summary tiles bar wraps gracefully on narrow screens
    - _Requirements: 22.1, 22.2, 22.3_
  
  - [ ] 8.2 Test state transitions and edge cases
    - Test tuned state with all fine-tune controls (st, dm, dt, tr, gr, pc)
    - Test mode switching resets tuned flag
    - Test peak-window edge cases (airport arrival at 4:00 PM, 7:00 PM boundaries)
    - _Requirements: 23.1, 23.2, 23.3, 10.2_
  
  - [ ] 8.3 Verify minimal UI pass visual quality
    - Check hero and footer text reads clearly and concisely
    - Verify spacing feels tighter without cramping
    - Confirm no "Looks open" pills appear anywhere
    - Verify note text clamps to 2 lines in card view
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

## Notes

- All changes stay within the single-file architecture (no build step, no external dependencies beyond Google Fonts)
- The design preserves existing AWS SBG GEU UI tokens (#AD5CFF accent, Plus Jakarta Sans/JetBrains Mono fonts)
- Daylight warnings for Mountain_Trip stops render independently of tuned state (safety-first design choice)
- The Highland Bakehouse & Pizzeria entry retains its u:1 flag until owner supplies verified data
- Readers Coffee House (rdr) and Koi (koi) entries remain unchanged with "Check hours" badges until data available
- Manual verification tasks ensure visual quality and responsive behavior match requirements

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "4.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "6.1", "6.2"] },
    { "id": 3, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
