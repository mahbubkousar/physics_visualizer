import test from 'node:test';
import assert from 'node:assert/strict';

import chatHandler from '../netlify/functions/gemini-chat.mjs';
import evaluateHandler from '../netlify/functions/gemini-evaluate.mjs';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.GEMINI_API_KEY;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalApiKey;
  }
});

function jsonRequest(url, body, method = 'POST', headers = {}) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: method === 'POST' ? JSON.stringify(body) : undefined
  });
}

test('chat rejects non-POST requests', async () => {
  const response = await chatHandler(jsonRequest('https://example.test/api/gemini/chat', {}, 'GET'));
  assert.equal(response.status, 405);
  assert.deepEqual(await response.json(), { error: 'Method not allowed.' });
});

test('AI endpoints reject cross-origin browser requests', async () => {
  globalThis.fetch = async () => assert.fail('Gemini should not be called');
  const request = jsonRequest(
    'https://example.test/api/gemini/chat',
    { history: [{ role: 'user', parts: [{ text: 'Explain gravity.' }] }] },
    'POST',
    { Origin: 'https://attacker.example', 'Sec-Fetch-Site': 'cross-site' }
  );

  const response = await chatHandler(request);
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'Cross-site requests are not allowed.' });
});

test('chat fails safely when the server credential is missing', async () => {
  delete process.env.GEMINI_API_KEY;
  const response = await chatHandler(jsonRequest('https://example.test/api/gemini/chat', {
    history: [{ role: 'user', parts: [{ text: 'Explain gravity.' }] }]
  }));

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'AI service is not configured.' });
});

test('chat authenticates upstream through a header and returns only text', async () => {
  process.env.GEMINI_API_KEY = 'server-test-key';
  let upstreamUrl;
  let upstreamOptions;
  globalThis.fetch = async (url, options) => {
    upstreamUrl = url;
    upstreamOptions = options;
    return Response.json({
      candidates: [{ content: { parts: [{ text: 'Gravity accelerates objects downward.' }] } }]
    });
  };

  const response = await chatHandler(jsonRequest('https://example.test/api/gemini/chat', {
    history: [{ role: 'user', parts: [{ text: 'Explain gravity.' }] }]
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { text: 'Gravity accelerates objects downward.' });
  assert.equal(upstreamOptions.headers['x-goog-api-key'], 'server-test-key');
  assert.equal(upstreamUrl.includes('server-test-key'), false);
});

test('evaluation rejects unknown questions without contacting Gemini', async () => {
  process.env.GEMINI_API_KEY = 'server-test-key';
  globalThis.fetch = async () => assert.fail('Gemini should not be called');

  const response = await evaluateHandler(jsonRequest('https://example.test/api/gemini/evaluate', {
    tutorial: 'projectile-motion',
    questionId: 'unknown',
    answer: 'An answer'
  }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Unknown tutorial or question.' });
});

test('evaluation validates and returns structured model output', async () => {
  process.env.GEMINI_API_KEY = 'server-test-key';
  globalThis.fetch = async () => Response.json({
    candidates: [{
      content: { parts: [{ text: JSON.stringify({ score: 8, feedback: 'Good reasoning.' }) }] }
    }]
  });

  const response = await evaluateHandler(jsonRequest('https://example.test/api/gemini/evaluate', {
    tutorial: '2d-graphs',
    questionId: 'question1',
    answer: 'Move right five and down three, into quadrant four.'
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { score: 8, feedback: 'Good reasoning.' });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin');
});
