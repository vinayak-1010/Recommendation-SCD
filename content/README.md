# 📚 Content & Editorial Management Guide
**AWS Student Community Day 2026 · Graphic Era (Deemed to be University), Clement Town, Dehradun**

This directory contains all human-editable narrative, places, and route blueprints for the Explore Doon × Mussoorie web app.

---

## 1. How to Edit the Motto and Story Narrative
All conference mottoes, narrative copy, and section headlines live in `content/story.ts`:

- **Event Metadata:** Update `EVENT_META` (name, dates, tagline, closing motto).
- **The Why:** Edit `THE_WHY.paragraphWords` array to modify the pinned scroll-lit keynote paragraph word-by-word.
- **The Promise:** Edit `THE_PROMISE` to adjust the three core architectural guarantees (No backtracking, Home before dark, Local not touristy).
- **Three Worlds:** Edit `THREE_WORLDS` to modify the altitude ranges, descriptive leads, or zone accent colors for The Valley, The Hills, or The River.
- **Keynote Story Chapters:** Edit `STORY_CHAPTERS` to adjust quotes, elevations, and local student notes.

---

## 2. How to Add or Update a Place
Places live in `content/places.json` and are validated against `content/schema.ts` (`PlaceSchema`):

```json
{
  "id": "new-place-id",
  "name": "Name of Landmark or Café",
  "zone": "valley", // "valley" | "hills" | "river" | "outskirts"
  "cluster": "clement-town", // "clement-town" | "rajpur" | "landour" | "mussoorie-town" | "east-doon" | "outskirts"
  "lat": 30.2705,
  "lng": 77.9965,
  "tags": ["culture", "photography"],
  "bestTime": "morning", // "morning" | "afternoon" | "sunset" | "night" | "any"
  "durationMin": 60,
  "fee": "Free / ₹50",
  "hours": "09:00–17:00",
  "closedDays": [], // e.g. ["Monday"]
  "seasonality": "all-year", // "all-year" | "avoid-monsoon" | "winter-only" | "summer-only"
  "bestSeasons": ["autumn", "winter", "spring"],
  "accessibility": "Step-free ramp to main prayer courtyard.",
  "foodNearby": "Tingmo and butter tea in Clement Town colony.",
  "tip": "Local insider advice from Graphic Era students.",
  "images": ["mind.jpg"],
  "sources": ["Official Website", "Field Visit 2026"],
  "lastVerified": "2026-10-15",
  "verify": false // Set to true if timings or fees need field confirmation!
}
```

> **Rule of Truth:** Never guess fees or hours. If unconfirmed, set `"verify": true` and record it in `NEEDS-VERIFICATION.md`.

---

## 3. How to Add or Update a Curated Route
Curated signature routes live in `content/routes.json` and are validated against `content/schema.ts` (`CuratedRouteSchema`):

```json
{
  "id": "route-new-custom",
  "title": "Title of Blueprint",
  "subtitle": "One-line summary",
  "zone": "hills",
  "durationHours": 7.5,
  "leaveBy": "08:00 AM",
  "recommendedTransport": "cab",
  "badge": "Signature Mountain Day",
  "coverImage": "land.jpg",
  "description": "Full narrative description.",
  "stops": ["maggi", "land", "geo"],
  "whyThisOrder": "Topological reasoning explaining zero backtracking.",
  "sunsetNotice": "Descent cutoff time warning."
}
```

---

## 4. How to Update Seasonal Advice & Mountain Rules
- **Monsoon Logic:** Heavy rains trigger landslide alerts and advise avoiding Kempty Falls or gorge wading at Gucchupani.
- **Winter Logic:** Winterline sunsets at George Everest and Lal Tibba peak between mid-October and January.
- **Rafting & Safaris:** Shivpuri white water rafting operates Oct–June; Rajaji Tiger Reserve safaris open Nov 15 – June 15.
- Update seasonal advisories in `src/engine/traffic.ts` and `src/ui/weather.ts`.

---

## 5. How to Validate & Deploy to Vercel

1. **Lint and Validate Content Schemas:**
   ```bash
   npm run data:lint
   ```
2. **Run Test Suite:**
   ```bash
   npm test
   ```
3. **Build Bundles:**
   ```bash
   npm run build
   ```
4. **Deploy to Vercel:**
   ```bash
   npx vercel --prod --yes
   ```
