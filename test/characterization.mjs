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

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

async function runCharacterization() {
  console.log('Running characterization tests...');

  // Characterization 1: Default Day Mode plan
  {
    const { document } = loadPage();
    await delay(100);
    const out = document.querySelector('#out').innerHTML;
    assert(out.includes('Landour: Lal Tibba &amp; Char Dukan'), 'Default plan should include Landour');
    assert(out.includes('Maggi stop on Mussoorie Road'), 'Default plan with car and no vibes includes Maggi stop');
    assert(out.includes('Mindrolling Monastery'), 'Default plan includes Mindrolling Monastery');
    assert(out.includes('Back to campus'), 'Default plan includes back to campus leg');
  }

  // Characterization 2: Evening Mode with night vibe
  {
    const { document } = loadPage();
    selectRadio(document, '#g-md', 'eve');
    toggleCheckbox(document, '#g-in', 'night');
    await delay(100);
    const out = document.querySelector('#out').innerHTML;
    assert(out.includes('Your evening'), 'Evening mode renders Your evening title');
    assert(out.includes('Safe night out.'), 'Night vibe shows safety notice');
    assert(out.includes('Centrio Mall') || out.includes('Romeo Lane') || out.includes('Playboy') || out.includes('Farzi') || out.includes('Rumours'), 'Evening plan selects an evening venue');
  }

  // Characterization 3: Auto/walk mode excludes mountain trips
  {
    const { document } = loadPage();
    selectRadio(document, '#g-tr', 'none');
    await delay(100);
    const out = document.querySelector('#out').innerHTML;
    assert(!out.includes('Landour: Lal Tibba'), 'Auto/walk mode must exclude Landour in baseline');
    assert(out.includes('Mindrolling Monastery'), 'Auto/walk mode includes Mindrolling Monastery');
  }

  console.log('characterization: OK — baseline behavior preserved and recorded');
}

runCharacterization().catch(err => {
  console.error(err);
  process.exit(1);
});
