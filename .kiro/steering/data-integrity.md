# Data Integrity & Verification Standards

**Project:** Explore Doon × Mussoorie (AWS Student Community Day 2026)

---

## 1. Absolute Non-Negotiable: Never Invent Facts

1. **No Fabricated Data:** Under zero circumstances shall coordinates, operating hours, ticket prices, fees, road closures, or travel times be made up and presented as verified facts.
2. **Explicit Verification Tiers:**
   - `verified`: Confirmed directly with venue staff, official website, or recent physical visit by the SBG team.
   - `reported`: Documented in reputable secondary sources (news, travel blogs) or local community reports.
   - `estimated`: Derived algorithmically from typical road models, distance geometry, or local rules of thumb.
   - `unknown`: No authoritative data available. Displayed honestly to the user with a "Check hours / Call ahead" chip.
3. **Coordinates Policy:**
   - Coordinates must be sourced from OpenStreetMap (OSM/Nominatim/Overpass), the SBG team's verified list, or marked `null`.
   - If `coords` is `null`, the engine falls back to cluster-level travel estimations and explicitly labels the leg as *estimated*. Never guess arbitrary lat/lng coordinates.
4. **Hours & Pricing Policy:**
   - Null or missing hours must never be assumed to mean "open 24/7" or "open right now".
   - The UI must render an amber status chip (`Check hours` or `Unverified`), prompting a call before visiting.
5. **Automated Verification Checklist:**
   - The build process must run `npm run data:lint`.
   - Maintain `docs/DATA-VERIFICATION-CHECKLIST.md` listing all items marked `reported`, `estimated`, or `unknown`, grouped by geographic cluster with actionable phone/visit verification tasks for the on-ground team.
