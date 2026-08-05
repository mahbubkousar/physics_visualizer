import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { prefersReducedMotion } from '../src/core/accessibility.js';

const root = new URL('../', import.meta.url);
const activePages = [
  'index.html',
  'tutorials/2d-graphs/index.html',
  'tutorials/projectile-motion/index.html'
];

test('active pages provide skip navigation and shared accessibility styles', async () => {
  for (const file of activePages) {
    const html = await readFile(new URL(file, root), 'utf8');
    assert.match(html, /class="skip-link" href="#main-content"/);
    assert.match(html, /<main\b[^>]*id="main-content"/);
    assert.match(html, /href="\/css\/accessibility\.css"/);
  }
});

test('story viewers expose modal dialog semantics', async () => {
  for (const file of activePages.slice(1)) {
    const html = await readFile(new URL(file, root), 'utf8');
    assert.match(html, /id="storyViewer"[^>]*role="dialog"/);
    assert.match(html, /aria-modal="true"/);
    assert.match(html, /aria-labelledby="storyViewerTitle"/);
    assert.match(html, /aria-hidden="true"/);
  }
});

test('reduced-motion preference is detected safely', () => {
  const originalMatchMedia = globalThis.matchMedia;
  globalThis.matchMedia = query => ({ matches: query.includes('prefers-reduced-motion') });
  try {
    assert.equal(prefersReducedMotion(), true);
  } finally {
    if (originalMatchMedia === undefined) delete globalThis.matchMedia;
    else globalThis.matchMedia = originalMatchMedia;
  }
});
