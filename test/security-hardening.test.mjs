import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const htmlFiles = [
  'index.html',
  'tutorials/2d-graphs/index.html',
  'tutorials/projectile-motion/index.html',
  'tutorials/projectile-motion/index_prev.html'
];

test('HTML contains no inline scripts or event handlers', async () => {
  for (const file of htmlFiles) {
    const html = await readFile(new URL(file, root), 'utf8');
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i, `${file} contains an inline event handler`);

    for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
      assert.equal(script[1].trim(), '', `${file} contains an inline script`);
    }
  }
});

test('tutorial scripts do not depend on removed inline-handler attributes', async () => {
  for (const file of [
    'tutorials/2d-graphs/tutorial.js',
    'tutorials/projectile-motion/tutorial.js'
  ]) {
    const source = await readFile(new URL(file, root), 'utf8');
    assert.doesNotMatch(source, /\[onclick=/, `${file} queries an inline-handler attribute`);
  }
});

test('Netlify enforces the public-site security baseline', async () => {
  const config = await readFile(new URL('netlify.toml', root), 'utf8');
  const csp = config.match(/Content-Security-Policy = "([^"]+)"/)?.[1] || '';
  const scriptPolicy = csp.match(/script-src ([^;]+)/)?.[1] || '';

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(scriptPolicy, /'unsafe-inline'/);
  assert.doesNotMatch(scriptPolicy, /'unsafe-eval'/);
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /Permissions-Policy/);
  assert.match(config, /X-Content-Type-Options = "nosniff"/);
});
