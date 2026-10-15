# Design System: AWS SBG GEU × Apple-Grade Smoothness

**Project:** Explore Doon × Mussoorie (AWS Student Community Day 2026)

---

## 1. Brand Tokens & Surfaces

### Palette (Dark Theme Default & Light Theme Overrides)
```css
:root {
  /* Brand */
  --ac: #AD5CFF;            /* Primary Violet */
  --ac-edge: #731ED0;       /* Pressed / Bottom Edge */
  --ac-glow: rgba(173, 92, 255, 0.28);
  --blue: #1E51EC;          /* Secondary Accent */
  --pink: #F44159;          /* Night / Bars */

  /* Surfaces (Dark Default) */
  --bg: #05070E;
  --card: #0A0C13;
  --panel: #090E1E;
  --sec: #181D27;
  --line: rgba(255, 255, 255, 0.10);
  --line-soft: rgba(255, 255, 255, 0.08);

  /* Typography */
  --tx: #F1F5F9;
  --t2: #CBD5E1;
  --mu: #94A3B8;

  /* Semantics */
  --ok: #00D492;   /* Verified, on-time */
  --wa: #FFB900;   /* Check hours, heavy traffic */
  --bd: #FF4A3C;   /* Strenuous, infeasible */

  /* Gradients & Shapes */
  --hero: linear-gradient(135deg, #AD5CFF 0%, #731ED0 55%, #1E51EC 100%);
  --r-xl: 28px;
  --r-lg: 20px;
  --r-md: 14px;
  --r-pill: 999px;

  /* Motion Curves */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-ios: cubic-bezier(0.32, 0.72, 0, 1);
  --spring: linear(0, 0.62 8%, 1.08 20%, 0.97 34%, 1.01 50%, 1);
  --dur-press: 0.18s;
  --dur: 0.32s;
  --dur-sheet: 0.5s;
}

.light {
  --bg: #ffffff;
  --card: #fafafa;
  --panel: #f4f4f5;
  --sec: #e4e4e7;
  --line: #e4e4e7;
  --line-soft: #f4f4f5;
  --tx: #0a0a0a;
  --t2: #3f3f46;
  --mu: #52525b;
  --ok: #047857;
  --wa: #b45309;
  --bd: #dc2626;
}
```

### Typography Hierarchy
- **Body & Headings:** `Plus Jakarta Sans`, system-ui fallback.
- **Clock Times, Durations & Math:** `JetBrains Mono`, monospace fallback.
- **Hero Title:** `clamp(34px, 9vw, 56px)`, weight 800, line-height 1.05, tracking `-0.035em`.

---

## 2. Apple-Grade Materials & Depth

- **Glass Surfaces:** `background: color-mix(in srgb, var(--panel) 72%, transparent); backdrop-filter: saturate(180%) blur(20px); border: 1px solid var(--line-soft)` for sticky headers, Dynamic-Island summary pills, and modal sheets.
- **Layered Violet Shadows:** Use tinted glow shadows (`0 10px 30px -12px var(--ac-glow)`), never harsh opaque black drops.
- **Squircles:** `@supports (corner-shape: squircle) { corner-shape: squircle; }` with fallback rounded borders.

---

## 3. Motion Principles (Smooth & Lightweight)

- **Strict Transform & Opacity:** Animate strictly `transform` and `opacity` to maintain 60/120 fps without layout thrashing.
- **Tactile Feedback:** Scale `0.97` on press with spring restoration; trigger `navigator.vibrate?.(8)` for native haptic clicks where supported.
- **View Transitions & FLIP:** Reorders, card-to-sheet expansions, and replans utilize `document.startViewTransition` or FLIP coordinates.
- **Prefers-Reduced-Motion:** When `@media (prefers-reduced-motion: reduce)` is active, immediately bypass all non-essential transitions and animations.
- **Day Dial:** A signature 5 AM–11 PM scrubbing slider with live usable time display, background traffic heat strip, and sunset safe-window indicators.
