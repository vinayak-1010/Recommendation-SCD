import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');

if (!existsSync(distDir) || !existsSync(assetsDir)) {
  console.error('Error: dist/ or dist/assets/ not found. Run npm run build first.');
  process.exit(1);
}

const files = readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  console.error('Error: Could not locate built CSS and JS chunks in dist/assets.');
  process.exit(1);
}

const cssContent = readFileSync(path.join(assetsDir, cssFile), 'utf8');
const jsContent = readFileSync(path.join(assetsDir, jsFile), 'utf8');

const singleHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Explore Doon × Mussoorie · AWS Student Community Day 2026</title>
  <meta name="description" content="Local travel experience engine for AWS Student Community Day 2026 at Graphic Era Deemed to be University, Clement Town, Dehradun. Feasible, zero-backtracking, daylight-safe itineraries.">
  <meta name="theme-color" content="#AD5CFF">
  <!--
  EMBED CONTRACT:
  <iframe src="https://YOUR-DOMAIN/scd-explore-doon.html?embed=1" title="Explore Doon" style="width:100%;border:0;min-height:700px" loading="lazy"></iframe>
  AUTO-HEIGHT: addEventListener('message', e => { if (e.data && e.data.scd === 'h') { document.querySelector('iframe[title="Explore Doon"]').style.height = e.data.h + 'px'; } });
  URL OPTIONS: ?embed=1 (hides hero/header) · &theme=light|dark · &transparent=1
  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Rozha+One&family=Yatra+One&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="app"></div>

  <script type="module">
${jsContent}
  </script>
</body>
</html>
`;

const outputPath = path.join(distDir, 'scd-explore-doon.html');
writeFileSync(outputPath, singleHtml, 'utf8');

console.log(`✓ Single-file bundle generated successfully at: ${outputPath}`);
console.log(`  File size: ${(Buffer.byteLength(singleHtml) / 1024).toFixed(1)} KB`);
