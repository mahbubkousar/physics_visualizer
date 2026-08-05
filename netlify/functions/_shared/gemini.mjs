const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 25_000;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export function assertSameOrigin(request) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    throw new HttpError(403, 'Cross-site requests are not allowed.');
  }

  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    throw new HttpError(403, 'Cross-origin requests are not allowed.');
  }
}

export async function readJsonRequest(request, maxBytes) {
  if (request.method !== 'POST') {
    throw new HttpError(405, 'Method not allowed.');
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'Content-Type must be application/json.');
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new HttpError(413, 'Request body is too large.');
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
    throw new HttpError(413, 'Request body is too large.');
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    throw new HttpError(400, 'Request body must contain valid JSON.');
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  return body;
}

export async function generateContent(contents, generationConfig) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpError(503, 'AI service is not configured.');
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
    throw new Error('Invalid GEMINI_MODEL configuration.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_ROOT}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({ contents, generationConfig }),
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new HttpError(504, 'AI service timed out.');
    }
    throw new HttpError(502, 'AI service is temporarily unavailable.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Do not expose provider responses: they may contain account or quota details.
    console.error('Gemini request failed with status', response.status);
    if (response.status === 429) {
      throw new HttpError(429, 'AI request limit reached. Please try again shortly.');
    }
    throw new HttpError(502, 'AI service could not complete the request.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new HttpError(502, 'AI service returned an invalid response.');
  }

  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.find(part => typeof part?.text === 'string')?.text;
  if (!text) {
    const blocked = candidate?.finishReason === 'SAFETY' || candidate?.finishReason === 'RECITATION';
    throw new HttpError(blocked ? 422 : 502, blocked
      ? 'The AI response was blocked by safety controls.'
      : 'AI service returned no content.');
  }

  return text;
}

export function errorResponse(error) {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status);
  }

  console.error('Unexpected function error:', error instanceof Error ? error.message : 'Unknown error');
  return jsonResponse({ error: 'Internal server error.' }, 500);
}
