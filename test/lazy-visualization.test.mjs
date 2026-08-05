import test from 'node:test';
import assert from 'node:assert/strict';

import { whenNearViewport } from '../src/core/lazy-visualization.js';

const originalIntersectionObserver = globalThis.IntersectionObserver;

test.afterEach(() => {
  if (originalIntersectionObserver === undefined) {
    delete globalThis.IntersectionObserver;
  } else {
    globalThis.IntersectionObserver = originalIntersectionObserver;
  }
});

test('visualization loading falls back safely without IntersectionObserver', async () => {
  delete globalThis.IntersectionObserver;
  await whenNearViewport({});
});

test('visualization loading waits until its container approaches the viewport', async () => {
  let callback;
  let observedElement;
  let disconnected = false;

  globalThis.IntersectionObserver = class {
    constructor(handler, options) {
      callback = handler;
      assert.equal(options.rootMargin, '600px');
    }

    observe(element) {
      observedElement = element;
    }

    disconnect() {
      disconnected = true;
    }
  };

  const element = {};
  let resolved = false;
  const ready = whenNearViewport(element).then(() => {
    resolved = true;
  });

  assert.equal(observedElement, element);
  callback([{ isIntersecting: false }]);
  await Promise.resolve();
  assert.equal(resolved, false);

  callback([{ isIntersecting: true }]);
  await ready;
  assert.equal(resolved, true);
  assert.equal(disconnected, true);
});
