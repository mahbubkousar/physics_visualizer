const accessibleNames = Object.freeze({
  searchInput: 'Search tutorials',
  storyViewerClose: 'Close story',
  storyNavPrev: 'Previous story',
  storyNavNext: 'Next story',
  pointSpeedSelect: 'Point animation speed',
  pointPlayPauseBtn: 'Play or pause point animation',
  pointReplayBtn: 'Replay point animation',
  pointPrevBtn: 'Previous point animation frame',
  pointNextBtn: 'Next point animation frame',
  'point-x': 'X coordinate',
  'point-y': 'Y coordinate',
  comparisonSpeedSelect: 'Comparison animation speed',
  comparisonPlayPauseBtn: 'Play or pause comparison animation',
  comparisonReplayBtn: 'Replay comparison animation',
  comparisonPrevBtn: 'Previous comparison animation frame',
  comparisonNextBtn: 'Next comparison animation frame',
  staticSpeedSelect: 'Projectile animation speed',
  staticPlayPauseBtn: 'Play or pause projectile animation',
  staticReplayBtn: 'Replay projectile animation',
  staticPrevBtn: 'Previous projectile animation frame',
  staticNextBtn: 'Next projectile animation frame',
  'static-v0': 'Initial velocity in metres per second',
  'static-angle': 'Launch angle in degrees',
  'static-y0': 'Initial height in metres',
  example1SpeedSelect: 'Example animation speed',
  example1PlayPauseBtn: 'Play or pause example animation',
  example1ReplayBtn: 'Replay example animation',
  example1PrevBtn: 'Previous example animation frame',
  example1NextBtn: 'Next example animation frame',
  q1Input: 'Answer to quiz question 1',
  q2Input: 'Answer to quiz question 2',
  q3Input: 'Answer to quiz question 3',
  'q1-input': 'Answer to quiz question 1',
  'q2-input': 'Answer to quiz question 2',
  'q3-input': 'Answer to quiz question 3',
  'desc-q1': 'Detailed answer to question 1',
  'desc-q2': 'Detailed answer to question 2',
  chatInput: 'Ask the AI tutor a question',
  sendBtn: 'Send message',
  chatSpeedSelect: 'Chat visualization animation speed',
  chatPlayPauseBtn: 'Play or pause chat visualization',
  chatReplayBtn: 'Replay chat visualization',
  chatPrevBtn: 'Previous chat visualization frame',
  chatNextBtn: 'Next chat visualization frame',
  btnTOC: 'Open table of contents',
  btnAI: 'Go to AI tutor'
});

export function enhanceAccessibility() {
  for (const [id, name] of Object.entries(accessibleNames)) {
    const element = document.getElementById(id);
    if (element && !element.getAttribute('aria-label')) {
      element.setAttribute('aria-label', name);
    }
  }

  document.querySelectorAll('.story-item').forEach(item => {
    const title = item.querySelector('.story-item-title')?.textContent?.trim() || 'Learning fact';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Open story: ${title}`);
  });

  for (const id of ['storyNavPrev', 'storyNavNext']) {
    const control = document.getElementById(id);
    control?.setAttribute('role', 'button');
    control?.setAttribute('tabindex', '0');
  }

  document.querySelectorAll('.quiz-feedback, .ai-feedback, .info-display').forEach(element => {
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
  });

  document.querySelectorAll('.quiz-options').forEach(group => {
    group.setAttribute('role', 'radiogroup');
    const question = group.closest('.quiz-question')?.querySelector('p')?.textContent?.trim();
    if (question) group.setAttribute('aria-label', question);
  });

  for (const id of ['progressPercent', 'scoreDisplay']) {
    const value = document.getElementById(id);
    value?.setAttribute('aria-live', 'polite');
  }

  const typingIndicator = document.getElementById('typingIndicator');
  typingIndicator?.setAttribute('role', 'status');
  typingIndicator?.setAttribute('aria-label', 'AI tutor is responding');

  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.setAttribute('role', 'log');
    chatMessages.setAttribute('aria-live', 'polite');
    chatMessages.setAttribute('aria-relevant', 'additions text');
  }

  const tocButton = document.getElementById('btnTOC');
  tocButton?.setAttribute('aria-controls', 'tocPanel');
  tocButton?.setAttribute('aria-expanded', 'false');
  document.getElementById('tocPanel')?.setAttribute('aria-label', 'Table of contents');

  document.querySelectorAll('#chatVisualization').forEach(element => {
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', 'Interactive visualization; numeric values are shown in the adjacent controls');
  });

  document.querySelectorAll('button i, a i').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
}

export function prefersReducedMotion() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
