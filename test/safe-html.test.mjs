import test from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeHTML,
  formatSafeFeedback,
  formatSafeText
} from '../src/core/safe-html.js';

const ATTACK_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror="alert(1)">',
  '<svg onload=alert(1)>',
  '<a href="javascript:alert(1)">click</a>',
  '&lt;img src=x onerror=alert(1)&gt;',
  '**<img src=x onerror=alert(1)>**'
];

function assertOnlyAllowedTags(output, allowedTags, payload) {
  const tagPattern = new RegExp(`</?(?:${allowedTags.join('|')})>`, 'g');
  const textOnly = output.replace(tagPattern, '');
  assert.equal(/[<>]/.test(textOnly), false, payload);

  for (const tag of output.match(/<[^>]+>/g) || []) {
    assert.equal(tagPattern.test(tag), true, `Unexpected generated tag ${tag}`);
    tagPattern.lastIndex = 0;
  }
}

test('escapeHTML encodes all characters that can form HTML attributes or tags', () => {
  assert.equal(
    escapeHTML(`<tag attr="value" other='x'>&`),
    '&lt;tag attr=&quot;value&quot; other=&#39;x&#39;&gt;&amp;'
  );
});

test('chat formatting never preserves attacker-controlled tags', () => {
  for (const payload of ATTACK_PAYLOADS) {
    const output = formatSafeText(payload);
    assertOnlyAllowedTags(output, ['strong', 'em', 'code', 'br'], payload);
  }
});

test('feedback formatting never preserves attacker-controlled tags', () => {
  for (const payload of ATTACK_PAYLOADS) {
    const output = formatSafeFeedback(payload);
    assertOnlyAllowedTags(output, ['p', 'strong', 'em', 'code', 'br', 'ul', 'ol', 'li'], payload);
  }
});

test('feedback formatting generates only the intended presentational markup', () => {
  assert.equal(
    formatSafeFeedback('**Correct** and *clear* with `units`.\n\n- First\n- Second'),
    '<p><strong>Correct</strong> and <em>clear</em> with <code>units</code>.</p><ul><li>First</li><li>Second</li></ul>'
  );
  assert.equal(
    formatSafeFeedback('1. Horizontal motion\n2. Vertical motion'),
    '<ol><li>Horizontal motion</li><li>Vertical motion</li></ol>'
  );
});

test('MathJax delimiters remain text for MathJax to process later', () => {
  assert.equal(formatSafeFeedback('Use $R = v^2/g$.'), '<p>Use $R = v^2/g$.</p>');
});
