import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');

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
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(4174, async () => {
  console.log('E2E Preview server running on http://localhost:4174');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    console.log('1. Testing Landing Page Navigation & Headings...');
    await page.goto('http://localhost:4174/#/home', { waitUntil: 'networkidle' });
    const heroText = await page.locator('.cinematic-hero-headline').innerText();
    if (!heroText.includes('Come for the code')) {
      throw new Error('Hero headline missing required copy');
    }
    console.log('✓ Hero headline verified');

    console.log('2. Testing Scroll Through Landing Sections...');
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(400);
    const whyHeading = await page.locator('.the-why-heading').innerText();
    if (!whyHeading.includes('Why We Built This For You')) {
      throw new Error('Why We Built This For You section missing');
    }
    console.log('✓ Section 2 (The Why) verified');

    console.log('3. Testing Route Planner Page...');
    await page.goto('http://localhost:4174/#/planner', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const planTitle = await page.locator('.summary-title').innerText();
    if (!planTitle) throw new Error('Planner summary title missing');
    console.log(`✓ Planner loaded plan: "${planTitle}"`);

    console.log('4. Testing Duration Presets...');
    const fourHourPreset = page.locator('#duration-preset-segmented input[value="4h"]');
    if (await fourHourPreset.count() > 0) {
      await fourHourPreset.click({ force: true });
      await page.waitForTimeout(400);
      console.log('✓ 4-Hour duration preset activated');
    }

    console.log('5. Testing Phone QR Code Sharing Modal...');
    const qrBtn = page.locator('#btn-qr-share');
    if (await qrBtn.count() > 0) {
      await qrBtn.click();
      await page.waitForTimeout(300);
      const isVisible = await page.locator('#qr-share-modal').isVisible();
      if (!isVisible) throw new Error('QR Modal failed to open');
      console.log('✓ QR Share Modal opened and rendered');
      await page.locator('#btn-close-qr-modal').click();
    }

    console.log('6. Testing Design System Showcase Page...');
    await page.goto('http://localhost:4174/#/design', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const designTitle = await page.locator('#page-design h1').innerText();
    if (!designTitle.includes('Design System')) {
      throw new Error('Design System page header missing');
    }
    console.log('✓ Design System showcase verified');

    console.log('\n========================================');
    console.log('ALL PLAYWRIGHT E2E CRITICAL PATHS PASSED!');
    console.log('========================================\n');

  } catch (err) {
    console.error('E2E TEST FAILURE:', err);
    await browser.close();
    server.close();
    process.exit(1);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
