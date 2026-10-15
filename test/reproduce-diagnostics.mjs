import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'scd-explore-doon.html');
const html = readFileSync(htmlPath, 'utf8');

function loadPage() {
  const dom = new JSDOM(html, {
    url: 'http://localhost/scd-explore-doon.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    },
  });
  return { dom, window: dom.window, document: dom.window.document };
}

function fireChange(el) {
  const Event = el.ownerDocument.defaultView.Event;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function setValue(document, selector, value) {
  const el = document.querySelector(selector);
  el.value = value;
  fireChange(el);
}

function selectRadio(document, containerSelector, value) {
  const input = document.querySelector(`${containerSelector} input[value="${value}"]`);
  input.checked = true;
  fireChange(input);
}

function toggleCheckbox(document, containerSelector, value) {
  const input = document.querySelector(`${containerSelector} input[value="${value}"]`);
  input.checked = !input.checked;
  fireChange(input);
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function runDiagnostics() {
  console.log('--- RUNNING RC DIAGNOSTICS ---');

  // Test RC2: sel=nature,views,food, car, 08:00-17:00
  {
    const { document } = loadPage();
    setValue(document, '#st', '08:00');
    setValue(document, '#dm', 'none');
    setValue(document, '#dt', '17:00');
    selectRadio(document, '#g-tr', 'car');
    toggleCheckbox(document, '#g-in', 'nature');
    toggleCheckbox(document, '#g-in', 'views');
    toggleCheckbox(document, '#g-in', 'food');
    await delay(100);

    const out = document.querySelector('#out').innerHTML;
    console.log('RC2 test (nature+views+food, car, 08:00-17:00):');
    const stops = [...out.matchAll(/<h4>(.*?)<\/h4>/g)].map(m => m[1]);
    console.log('  Stops generated:', stops);
    // Notice how Landour (hill) + Maggi (hill road) + Mindrolling (Clement Town / campus side!) are selected together!
  }

  // Test RC1 & RC4: Check legs in code
  console.log('RC1 & RC4 check:');
  console.log('  leg() formula directly from source:');
  const legDef = html.match(/const leg=.*?;/)?.[0];
  console.log('  ', legDef);
  const ordDef = html.match(/const ord=.*?;/)?.[0];
  console.log('  ', ordDef);

  // Test RC3: Check tag overlap
  console.log('RC3 check:');
  const dMatches = [...html.matchAll(/{id:'(.*?)'.*?tg:\[(.*?)\].*?}/g)].map(m => ({ id: m[1], tags: m[2] }));
  console.log('  Places and tags sample:', dMatches.slice(0, 5));

  // Test RC5: Food engine
  console.log('RC5 check:');
  const pickEDef = html.match(/const pickE=.*?;/)?.[0];
  console.log('  ', pickEDef);

  // Test RC6: Unverified places excluded
  console.log('RC6 check:');
  const unverifiedFilter = html.includes('x.u||x.onroute||S.includes(x)');
  console.log('  Includes filter x.u in greedy loop:', unverifiedFilter);
  const fxRendered = html.includes('.fx');
  console.log('  Any reference to .fx in rendering:', fxRendered);

  // Test RC10: Sunday hardcoded
  console.log('RC10 check:');
  const sundayCount = (html.match(/Sunday/gi) || []).length;
  console.log('  Occurrences of "Sunday" in HTML:', sundayCount);

  // Test RC11: tr==='none' mountain filter
  console.log('RC11 check:');
  const autoFilter = html.includes("d.mt&&tr==='none'");
  console.log('  Auto/walk filters out all mountain trips:', autoFilter);

  console.log('--- DIAGNOSTICS COMPLETE ---');
}

runDiagnostics();
