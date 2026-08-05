import {
  HttpError,
  errorResponse,
  generateContent,
  jsonResponse,
  readJsonRequest
} from './_shared/gemini.mjs';

const MAX_BODY_BYTES = 32_000;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOTAL_CHARS = 24_000;

const SYSTEM_PROMPT = `You are a clear, accurate, encouraging physics tutor.

You may create visualizations by including a JSON code block. Only these tools exist:

1. plot_2d_point
Required numeric parameters: x, y. Optional numeric parameter: color.

2. projectile_motion
Required numeric parameters: v0, theta. Optional numeric parameters: x0, y0, g, color.

Use exactly this command shape:
\`\`\`json
{"action":"visualize","tool":"tool_id","parameters":{}}
\`\`\`

Explain calculations step by step, include units, and use visualization commands only when useful. Never claim access to tools other than those listed.`;

function validateHistory(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) {
    throw new HttpError(400, `history must contain between 1 and ${MAX_MESSAGES} messages.`);
  }

  let totalChars = 0;
  const history = value.map((message, index) => {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      throw new HttpError(400, `history[${index}] must be an object.`);
    }
    if (message.role !== 'user' && message.role !== 'model') {
      throw new HttpError(400, `history[${index}] has an invalid role.`);
    }
    if (!Array.isArray(message.parts) || message.parts.length !== 1) {
      throw new HttpError(400, `history[${index}] must contain exactly one text part.`);
    }

    const text = message.parts[0]?.text;
    if (typeof text !== 'string' || text.trim().length === 0 || text.length > MAX_MESSAGE_CHARS) {
      throw new HttpError(400, `history[${index}] contains invalid text.`);
    }
    totalChars += text.length;

    return { role: message.role, parts: [{ text }] };
  });

  if (totalChars > MAX_TOTAL_CHARS) {
    throw new HttpError(413, 'Conversation is too large. Start a new chat and try again.');
  }
  if (history.at(-1).role !== 'user') {
    throw new HttpError(400, 'The final history message must be from the user.');
  }

  return history;
}

export default async function handler(request) {
  try {
    const body = await readJsonRequest(request, MAX_BODY_BYTES);
    const history = validateHistory(body.history);
    const text = await generateContent([
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I will follow those tutoring and visualization instructions.' }] },
      ...history
    ], {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096
    });

    return jsonResponse({ text });
  } catch (error) {
    return errorResponse(error);
  }
}

export const config = {
  path: '/api/gemini/chat',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: ['domain', 'ip'],
    windowLimit: 15,
    windowSize: 60
  }
};
