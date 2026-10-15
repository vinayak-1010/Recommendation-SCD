import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');
const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/42abae20-f847-43da-9db3-e180a5a12477/screenshots';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

// Simple static server
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].split('#')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.join(DIST_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    // Check root or public
    filePath = path.join(process.cwd(), reqPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), 'public', reqPath);
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback to dist/index.html for SPA
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(4173, async () => {
  console.log('Static preview server running on http://localhost:4173');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.log('Default chromium not found, trying msedge...');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const viewports = [
    { name: 'mobile-375px', width: 375, height: 812, hash: '#/home' },
    { name: 'tablet-768px', width: 768, height: 1024, hash: '#/home' },
    { name: 'desktop-1440px', width: 1440, height: 900, hash: '#/home' },
    { name: 'planner-1440px', width: 1440, height: 900, hash: '#/planner' },
    { name: 'design-1440px', width: 1440, height: 900, hash: '#/design' }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`http://localhost:4173/${vp.hash}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for Leaflet / fonts / animations to settle

    const outPath = path.join(ARTIFACT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot: ${outPath} (${vp.width}x${vp.height})`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('All multi-viewport screenshots captured successfully!');
  process.exit(0);
});
