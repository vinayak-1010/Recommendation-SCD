import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const readJSON = (rel) => JSON.parse(readFileSync(path.join(rootDir, rel), 'utf8'));

console.log('--- LINTING DATASETS & VERIFYING INTEGRITY ---');

const clusters = readJSON('data/clusters.json');
const places = readJSON('data/places.json');
const eateries = readJSON('data/eateries.json');
const routes = readJSON('data/routes.json');
const traffic = readJSON('data/traffic.json');
const rules = readJSON('data/rules.json');

const clusterIds = new Set(clusters.map(c => c.id));
let errors = [];
let verificationChecklist = [];

const VALID_EXPERIENCE_TYPES = new Set([
  'viewpoint', 'forest-walk', 'heritage-house', 'heritage-church', 'monastery',
  'temple', 'waterfall', 'cave-stream', 'museum-garden', 'ropeway-viewpoint',
  'promenade', 'market', 'bakery', 'cafe-scenic', 'cafe-city', 'breakfast-local',
  'restaurant-sitdown', 'street-food', 'bar-lounge', 'club', 'trek', 'river-activity'
]);

// 1. Lint places
for (const p of places) {
  if (!p.id || !p.name) errors.push(`Place missing id or name: ${JSON.stringify(p)}`);
  if (!clusterIds.has(p.cluster)) errors.push(`Place ${p.id} has invalid cluster: ${p.cluster}`);
  if (!VALID_EXPERIENCE_TYPES.has(p.experienceType)) errors.push(`Place ${p.id} invalid experienceType: ${p.experienceType}`);
  if (!p.visit || typeof p.visit.typical !== 'number') errors.push(`Place ${p.id} missing visit duration definition`);
  if (!p.verification || !p.verification.status) errors.push(`Place ${p.id} missing verification status`);

  if (p.verification?.status !== 'verified') {
    verificationChecklist.push({
      id: p.id,
      name: p.name,
      cluster: p.cluster,
      kind: 'place',
      status: p.verification.status,
      source: p.verification.source || 'N/A'
    });
  }
}

// 2. Lint eateries
for (const e of eateries) {
  if (!e.id || !e.name) errors.push(`Eatery missing id or name: ${JSON.stringify(e)}`);
  if (!clusterIds.has(e.cluster)) errors.push(`Eatery ${e.id} has invalid cluster: ${e.cluster}`);
  if (!VALID_EXPERIENCE_TYPES.has(e.experienceType)) errors.push(`Eatery ${e.id} invalid experienceType: ${e.experienceType}`);
  if (!e.visit || typeof e.visit.typical !== 'number') errors.push(`Eatery ${e.id} missing visit duration definition`);
  if (!e.verification || !e.verification.status) errors.push(`Eatery ${e.id} missing verification status`);

  if (e.verification?.status !== 'verified') {
    verificationChecklist.push({
      id: e.id,
      name: e.name,
      cluster: e.cluster,
      kind: 'eatery',
      status: e.verification.status,
      source: e.verification.source || 'N/A'
    });
  }
}

// 3. Lint routes
for (const r of routes.matrix) {
  if (r.from !== 'campus' && !clusterIds.has(r.from)) errors.push(`Route invalid from: ${r.from}`);
  if (r.to !== 'campus' && !clusterIds.has(r.to)) errors.push(`Route invalid to: ${r.to}`);
  if (!r.freeFlowMin || typeof r.freeFlowMin.car !== 'number') errors.push(`Route ${r.from}->${r.to} missing freeFlowMin`);
}

if (errors.length) {
  console.error('Data linting FAILED with errors:');
  for (const err of errors) console.error('  - ' + err);
  process.exit(1);
}

console.log(`Places checked: ${places.length}`);
console.log(`Eateries checked: ${eateries.length}`);
console.log(`Routes checked: ${routes.matrix.length}`);
console.log('Integrity check PASSED.');

// 4. Generate docs/DATA-VERIFICATION-CHECKLIST.md
const checklistByCluster = {};
for (const item of verificationChecklist) {
  if (!checklistByCluster[item.cluster]) checklistByCluster[item.cluster] = [];
  checklistByCluster[item.cluster].push(item);
}

let doc = `# Data Verification Checklist for AWS SBG GEU Team

**Generated Automatically by:** \`npm run data:lint\`  
**Event Date:** October 31, 2026 (AWS Student Community Day)  
**Strict Policy:** Never fabricate venue facts, hours, or entry tickets. Unverified items remain marked with warning badges until physically or telephonically verified by the local team.

---

## Action Items for SBG On-Ground Team (Verify Before Oct 28)

| Cluster | Venue / Entity | Current Status | Notes / Existing Source | Action Needed | Verified? |
|---|---|---|---|---|---|
`;

for (const [cluster, items] of Object.entries(checklistByCluster)) {
  for (const item of items) {
    const action = item.status === 'unknown' ? 'Call venue owner / visit in person to confirm address & Sunday hours' : 'Confirm Sunday timing and entry rules';
    doc += `| \`${cluster}\` | **${item.name}** (\`${item.id}\`) | \`${item.status}\` | ${item.source} | ${action} | [ ] |\n`;
  }
}

doc += `
---

## Rules Verification Tasks (Within 72 Hours of Event)

1. **Mussoorie Tourist Registration:** Check barrier at Kincraig / Picture Palace for digital pass enforcement.
2. **Mall Road Vehicle Closures:** Confirm the exact evening barrier closure time (scheduled 4:30 PM).
3. **Police Weekend Traffic Plan:** Confirm whether Purkul / Kuthal Gate one-way diversion is active for Saturday/Sunday.
4. **Two-Wheeler Checkpoints:** Confirm whether two-wheelers are being permitted on the main Mussoorie road during peak hours.
`;

writeFileSync(path.join(rootDir, 'docs/DATA-VERIFICATION-CHECKLIST.md'), doc, 'utf8');
console.log('Generated docs/DATA-VERIFICATION-CHECKLIST.md successfully.');
