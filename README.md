# Explore Doon × Mussoorie
### Intelligent Travel Recommendation Engine for AWS Student Community Day 2026
**Venue:** Graphic Era Deemed to be University, Clement Town, Dehradun (30.2705° N, 77.9965° E)

[![CI / Verification](https://github.com/aws-scd/explore-doon/actions/workflows/ci.yml/badge.svg)](https://github.com/aws-scd/explore-doon/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-22%2B-brightgreen)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)

---

## Overview

**Explore Doon × Mussoorie** is a local travel experience engine built for attendees of **AWS Student Community Day 2026**.

Unlike generic itinerary generators that produce impossible plans or greedily assemble top-rated venues across disjoint mountain valleys, Explore Doon 2.0 uses a **constraint-first optimization model**:
- **Geographic Feasibility First:** Strictly clusters venues to prevent cross-hill backtracking (e.g. no jumping between Landour and George Everest in a 4-hour window).
- **Directional P80 Traffic Modeling:** Calibrated travel times across Doon Valley and the Mussoorie ghats with mode-specific speeds (`car`, `bike`, `walk`).
- **Astronomical Daylight Bounds:** Automatically computes sunset for Dehradun coordinates via NOAA solar algorithms, ensuring two-wheelers and mountain day-trippers return safely before dusk.
- **Strict Data Verification:** Zero hallucinated venues or hours. Unverified entries retain explicit check-hours warnings.
- **Three-Layer Progressive Maps:** Layer 1 deep links (Google Maps), Layer 2 on-demand embed, and Layer 3 keyless offline vector SVG.
- **Offline PWA Support:** Service worker caches app assets and itineraries for reliable access in low-connectivity mountain spots.

---

## Quick Start

### Prerequisites
- Node.js 22.0.0 or higher
- npm 10 or higher

### Installation
```bash
git clone https://github.com/aws-scd/explore-doon.git
cd explore-doon
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Builds
```bash
# Standard Vite production build (dist/)
npm run build

# Standalone self-contained single-file bundle (dist/scd-explore-doon.html)
npm run build:single
```

---

## Automated Test Suites

The project includes automated verification covering data schemas, unit properties, characterization baselines, and 10 realistic Golden Scenarios:

```bash
# Run unit tests, property checks, and legacy characterization baseline
npm test

# Run the 10 Golden Scenarios suite
npm run test:engine

# Run dataset schema and integrity linter
npm run data:lint

# Run Mussoorie blueprint scenario checks
node --experimental-strip-types test/engine-blueprints.ts

# Run interactive replanning and alternatives tests
node --experimental-strip-types test/engine-replan.ts

# Run Google Maps deep links verification
node --experimental-strip-types test/maps-links.ts
```

---

## 10 Golden Scenarios

| Scenario | Mode | Duration | Validated Behavior |
| :--- | :--- | :--- | :--- |
| **Golden 1** | Two-Wheeler | 2 Hours | Local Clement Town / City cluster; strictly no mountain trip. |
| **Golden 2** | Car / Cab | 4 Hours | East Doon nature + at most 1 café. |
| **Golden 3** | Car / Cab | 6 Hours | Coherent Landour morning cluster (Maggi → Char Dukan → Sisters' Bazaar). |
| **Golden 4** | Car / Cab | 10 Hours | Full-day Landour trip with scenic meal, returning before sunset. |
| **Golden 5** | Two-Wheeler | 10 Hours | Mountain trip forced off ghats ≥ 45 minutes before dark. |
| **Golden 6** | Car / Cab | Evening (18:00–23:00) | Rajpur Road nightlife only; zero mountain routing at night. |
| **Golden 7** | Car / Cab | Flight at 20:00 | P80 airport buffer derived to return strictly by 3:55 PM. |
| **Golden 8** | Auto / Walk | 1 Hour | Walking visit to Mindrolling Monastery & Great Stupa. |
| **Golden 9** | Cab | 4 Attendees | Fare estimation and ₹700–₹900 per-person cost split computed. |
| **Golden 10** | Any | Any | Regression defense against RC2 bug (`orc -> pic -> kfc`). |

---

## Embed Contract

The application is embeddable in conference portals, mobile webviews, or static wrappers:

```html
<iframe
  src="https://your-domain.com/scd-explore-doon.html?embed=1&theme=dark"
  title="Explore Doon"
  style="width:100%;border:0;min-height:700px"
  loading="lazy">
</iframe>

<script>
  // Automatic height resizing
  window.addEventListener('message', (event) => {
    if (event.data && event.data.scd === 'h') {
      const iframe = document.querySelector('iframe[title="Explore Doon"]');
      if (iframe) iframe.style.height = event.data.h + 'px';
    }
  });
</script>
```

### URL Query Parameters
- `?embed=1`: Hides the standalone header and optimizes vertical padding.
- `&theme=dark` or `&theme=light`: Explicitly sets color scheme.
- `&transparent=1`: Sets background to transparent for seamless blending.
- `&partySize=4`: Pre-configures group party size for fare splitting.
- `&locale=hi`: Pre-selects Hindi language narration.

---

## Cloud Deployment (AWS)

A CloudFormation template is provided in `infra/cloudformation.yaml` provisioning:
- Private S3 Bucket with AES256 server-side encryption.
- CloudFront Distribution with Origin Access Control (OAC), HTTP/3, and automatic HTTPS redirection.
- Edge caching policies optimized for single-page apps and immutable assets.

Deploy via AWS CLI:
```bash
aws cloudformation deploy \
  --template-file infra/cloudformation.yaml \
  --stack-name scd-explore-doon \
  --parameter-overrides ProjectName=scd-explore-doon
```

---

## License & Credits
Designed and engineered for **AWS Student Community Day 2026**, Graphic Era Deemed to be University, Dehradun.
- Image credits & attributions: [docs/IMAGE-CREDITS.md](docs/IMAGE-CREDITS.md)
- Data verification checklist: [docs/DATA-VERIFICATION-CHECKLIST.md](docs/DATA-VERIFICATION-CHECKLIST.md)
- Architectural diagnosis: [docs/ENGINE-DIAGNOSIS.md](docs/ENGINE-DIAGNOSIS.md)
