import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const MAX_INITIAL_JAVASCRIPT_BYTES = 100 * 1024;
const pages = [
  'index.html',
  'tutorials/projectile-motion/index.html',
  'tutorials/2d-graphs/index.html'
];

for (const page of pages) {
  const html = await readFile(resolve('dist', page), 'utf8');
  const assetPaths = new Set();

  for (const match of html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)="(\/assets\/[^"]+\.js)"/g)) {
    assetPaths.add(match[1]);
  }

  let initialBytes = 0;
  for (const assetPath of assetPaths) {
    initialBytes += (await stat(resolve('dist', assetPath.slice(1)))).size;
  }

  if (initialBytes > MAX_INITIAL_JAVASCRIPT_BYTES) {
    throw new Error(
      `${page} requires ${(initialBytes / 1024).toFixed(1)} KiB of initial JavaScript; ` +
      `the budget is ${MAX_INITIAL_JAVASCRIPT_BYTES / 1024} KiB.`
    );
  }

  console.log(`${page}: ${(initialBytes / 1024).toFixed(1)} KiB initial JavaScript`);
}
