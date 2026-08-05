/**
 * Escape untrusted text before adding a small, application-controlled subset
 * of presentational HTML. Raw HTML from users or models is never preserved.
 */
export function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEscapedInlineText(escapedText) {
  return escapedText
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>');
}

/**
 * Safe compact formatting for chat messages.
 * Generated tags: strong, em, code, br.
 */
export function formatSafeText(text) {
  return formatEscapedInlineText(escapeHTML(text)).replace(/\n/g, '<br>');
}

/**
 * Safe block formatting for evaluation feedback.
 * Generated tags: p, strong, em, code, br, ul, ol, li.
 */
export function formatSafeFeedback(text) {
  const escaped = escapeHTML(text).trim();
  if (!escaped) return '';

  return escaped.split(/\n{2,}/).map(block => {
    const lines = block.split('\n').map(line => line.trim());
    const bulletItems = lines.map(line => line.match(/^[*-]\s+(.+)$/));
    if (bulletItems.every(Boolean)) {
      return `<ul>${bulletItems.map(match => `<li>${formatEscapedInlineText(match[1])}</li>`).join('')}</ul>`;
    }

    const numberedItems = lines.map(line => line.match(/^\d+\.\s+(.+)$/));
    if (numberedItems.every(Boolean)) {
      return `<ol>${numberedItems.map(match => `<li>${formatEscapedInlineText(match[1])}</li>`).join('')}</ol>`;
    }

    return `<p>${lines.map(formatEscapedInlineText).join('<br>')}</p>`;
  }).join('');
}
