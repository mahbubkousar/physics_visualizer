// ===================================
// Imports
// ===================================

import { ToolsManager } from '../../src/core/tools-manager.js';
import { Projectile } from '../../src/tools/projectile.js';
import { Graph2D } from '../../src/tools/2dgraph.js';
import { ChatController } from '../../src/core/chat-controller.js';
import { initializeToolDefinitions } from '../../src/core/tool-definitions.js';
import { formatSafeFeedback } from '../../src/core/safe-html.js';
import { whenNearViewport } from '../../src/core/lazy-visualization.js';

// ===================================
// Story Feed System
// ===================================

const stories = [
  {
    title: "Speed of Light",
    content: "Light travels at 299,792,458 meters per second. At this speed, you could circle the Earth 7.5 times in just ONE second!",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    title: "Gravity Mystery",
    content: "Gravity is the weakest of the four fundamental forces, yet it dominates the universe at large scales. A tiny magnet can overcome Earth's entire gravitational pull!",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    title: "Quantum Leap",
    content: "Electrons can 'jump' between energy levels instantly without passing through the space in between. This is called a quantum leap!",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    title: "Time Dilation",
    content: "Time moves slower in stronger gravitational fields. Astronauts on the ISS age slightly slower than people on Earth - about 0.007 seconds over 6 months!",
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    title: "Black Holes",
    content: "A black hole's gravity is so strong that not even light can escape. The boundary of no return is called the 'event horizon.'",
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    title: "Newton's Apple",
    content: "The famous apple story is probably true! Newton himself told it later in life. The apple didn't hit his head though - he just saw it fall.",
    background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
  },
  {
    title: "Sound Barrier",
    content: "Sound travels at 343 m/s in air. The 'sonic boom' happens when an object moves faster than sound, creating a shock wave of compressed air.",
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  },
  {
    title: "Vacuum Power",
    content: "In a vacuum, a feather and a hammer fall at the exact same speed! This was famously demonstrated on the Moon by astronaut David Scott in 1971.",
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
  },
  {
    title: "Energy's Secret",
    content: "Energy cannot be created or destroyed, only transformed. Every bit of energy in your body was once part of stars that exploded billions of years ago!",
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
  },
  {
    title: "Atomic Truth",
    content: "Atoms are 99.9999999% empty space! If an atom were the size of a football stadium, its nucleus would be the size of a pea at the center.",
    background: "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)"
  },
  {
    title: "Terminal Speed",
    content: "When falling through air, objects reach a 'terminal velocity' where air resistance equals gravity. For humans, it's about 195 km/h (120 mph) belly-down!",
    background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)"
  }
];

let currentStoryIndex = 0;
let storyProgressTimer = null;
let viewedStories = new Set();

function initializeStoryFeed() {
  const storyItems = document.querySelectorAll('.story-item');
  const storyViewer = document.getElementById('storyViewer');
  const storyViewerClose = document.getElementById('storyViewerClose');
  const storyNavPrev = document.getElementById('storyNavPrev');
  const storyNavNext = document.getElementById('storyNavNext');

  // Add click handlers to story items
  storyItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openStory(index);
    });
  });

  // Close button
  storyViewerClose.addEventListener('click', closeStory);

  // Navigation
  storyNavPrev.addEventListener('click', () => {
    if (currentStoryIndex > 0) {
      showStory(currentStoryIndex - 1);
    }
  });

  storyNavNext.addEventListener('click', () => {
    if (currentStoryIndex < stories.length - 1) {
      showStory(currentStoryIndex + 1);
    } else {
      closeStory();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && storyViewer.classList.contains('active')) {
      closeStory();
    }
  });

  // Close on background click
  storyViewer.addEventListener('click', (e) => {
    if (e.target === storyViewer) {
      closeStory();
    }
  });
}

function openStory(index) {
  currentStoryIndex = index;
  const storyViewer = document.getElementById('storyViewer');
  storyViewer.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Create progress bars
  const progressBars = document.getElementById('storyProgressBars');
  progressBars.innerHTML = '';
  stories.forEach((_, i) => {
    const bar = document.createElement('div');
    bar.className = 'story-progress-bar';
    bar.innerHTML = '<div class="story-progress-bar-fill"></div>';
    progressBars.appendChild(bar);
  });

  showStory(index);
}

function showStory(index) {
  if (index < 0 || index >= stories.length) return;

  currentStoryIndex = index;
  const story = stories[index];

  // Mark as viewed
  viewedStories.add(index);
  const storyItem = document.querySelector(`.story-item[data-story-id="${index}"]`);
  if (storyItem) {
    storyItem.classList.add('viewed');
  }

  // Update viewer content
  const background = document.getElementById('storyViewerBackground');
  const text = document.getElementById('storyViewerText');
  const title = document.getElementById('storyViewerTitle');

  background.style.background = story.background;
  text.innerHTML = `
    <h2>${story.title}</h2>
    <p>${story.content}</p>
  `;
  title.textContent = story.title;

  // Update progress bars
  const progressBars = document.querySelectorAll('.story-progress-bar-fill');
  progressBars.forEach((bar, i) => {
    bar.classList.remove('active');
    bar.style.width = i < index ? '100%' : '0%';
  });

  if (progressBars[index]) {
    progressBars[index].classList.add('active');
  }

  // Auto-advance timer
  if (storyProgressTimer) {
    clearTimeout(storyProgressTimer);
  }

  storyProgressTimer = setTimeout(() => {
    if (index < stories.length - 1) {
      showStory(index + 1);
    } else {
      closeStory();
    }
  }, 5000); // 5 seconds per story
}

function closeStory() {
  const storyViewer = document.getElementById('storyViewer');
  storyViewer.classList.remove('active');
  document.body.style.overflow = '';

  if (storyProgressTimer) {
    clearTimeout(storyProgressTimer);
    storyProgressTimer = null;
  }
}

// Initialize story feed when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStoryFeed);
} else {
  initializeStoryFeed();
}

// ===================================
// Progress & Score Tracking System
// ===================================

let currentScore = 0;
let maxScore = 50; // 3 quiz questions (10 each) + 2 descriptive questions (10 each)
let sectionProgress = {};
let totalSections = 9;

// Initialize section tracking
for (let i = 1; i <= totalSections; i++) {
  sectionProgress[i] = false;
}

// Track scroll progress
function updateProgress() {
  const sections = document.querySelectorAll('[data-section]');
  const windowHeight = window.innerHeight;
  const scrollTop = window.scrollY;

  let completedSections = 0;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionNum = parseInt(section.dataset.section);

    // Consider section "seen" if user has scrolled 70% through it
    if (scrollTop + windowHeight > sectionTop + (sectionHeight * 0.7)) {
      if (!sectionProgress[sectionNum]) {
        sectionProgress[sectionNum] = true;
      }
    }
  });

  // Count completed sections
  completedSections = Object.values(sectionProgress).filter(v => v).length;

  // Calculate progress percentage
  const progressPercent = Math.round((completedSections / totalSections) * 100);

  // Update UI
  document.getElementById('progressPercent').textContent = progressPercent + '%';
  document.getElementById('progressBarFill').style.width = progressPercent + '%';
}

// Update score display
function updateScore(points) {
  currentScore = Math.min(currentScore + points, maxScore);
  document.getElementById('scoreDisplay').textContent = currentScore + '/' + maxScore;
}

// Scroll event listener for progress
window.addEventListener('scroll', updateProgress);

// Initial progress check
setTimeout(updateProgress, 500);

// ===================================
// Table of Contents Functionality
// ===================================

function toggleTOC() {
  const panel = document.getElementById('tocPanel');
  panel.classList.toggle('active');
}

function scrollToSection(sectionNum) {
  const section = document.getElementById(`section-${sectionNum}`);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toggleTOC();
  }
}

// Highlight active section in TOC
function updateTOCHighlight() {
  const sections = document.querySelectorAll('[data-section]');
  const tocLinks = document.querySelectorAll('.toc-list a');

  let currentSection = 1;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 150 && rect.bottom >= 150) {
      currentSection = parseInt(section.dataset.section);
    }
  });

  tocLinks.forEach((link, index) => {
    link.classList.toggle('active', index + 1 === currentSection);
  });
}

window.addEventListener('scroll', updateTOCHighlight);

// ===================================
// Floating AI Button
// ===================================

function scrollToChat() {
  const chatSection = document.getElementById('section-9');
  if (chatSection) {
    chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ===================================
// Quiz Question Handlers
// ===================================

// Question 1
function checkQuizQuestion1() {
  const input = document.getElementById('q1-input');
  const feedback = document.getElementById('q1-feedback');
  const feedbackText = document.getElementById('q1-feedback-text');
  const answer = input.value.trim().toLowerCase();

  // Accept variations of correct answer
  const correct = answer.includes('0') || answer === '0 m/s' || answer === '0m/s';

  if (correct) {
    feedback.className = 'quiz-feedback correct';
    feedbackText.innerHTML = '<strong>✓ Correct!</strong><br>At the peak, the projectile has momentarily stopped moving up and has not yet started to move down. Its vertical velocity is zero, but its horizontal velocity is still v<sub>x</sub>!';
    updateScore(10);
  } else {
    feedback.className = 'quiz-feedback incorrect';
    feedbackText.innerHTML = '<strong>✗ Incorrect.</strong><br>Think about what happens at the very top of the trajectory. The projectile is about to start falling back down, but for that instant...';
  }

  feedback.style.display = 'block';
}

// Question 2
function checkQuizQuestion2() {
  const selected = document.querySelector('input[name="q2"]:checked');
  const feedback = document.getElementById('q2-feedback');
  const feedbackText = document.getElementById('q2-feedback-text');

  if (!selected) {
    alert('Please select an answer');
    return;
  }

  const answer = selected.value;

  if (answer === 'stays') {
    feedback.className = 'quiz-feedback correct';
    feedbackText.innerHTML = '<strong>✓ Correct!</strong><br>There are no horizontal forces acting on the projectile (in our idealized model), so there is no horizontal acceleration. The horizontal velocity remains constant throughout the flight.';
    updateScore(10);
  } else {
    feedback.className = 'quiz-feedback incorrect';
    feedbackText.innerHTML = '<strong>✗ Incorrect.</strong><br>Remember, we\'re ignoring air resistance. What forces act in the horizontal direction? What does this mean for horizontal acceleration?';
  }

  feedback.style.display = 'block';
}

// Question 3
function checkQuizQuestion3() {
  const input = document.getElementById('q3-input');
  const feedback = document.getElementById('q3-feedback');
  const feedbackText = document.getElementById('q3-feedback-text');
  const answer = parseFloat(input.value);

  if (answer === 45) {
    feedback.className = 'quiz-feedback correct';
    feedbackText.innerHTML = '<strong>✓ Correct!</strong><br>The range formula R = (v₀² × sin(2θ)) / g is maximized when sin(2θ) is maximized. The maximum value of the sine function is 1, which occurs when its argument is 90°. So, 2θ = 90°, which means θ = 45°.';
    updateScore(10);
  } else {
    feedback.className = 'quiz-feedback incorrect';
    feedbackText.innerHTML = '<strong>✗ Incorrect.</strong><br>Look at the range formula: R = (v₀² × sin(2θ)) / g. When is sin(2θ) at its maximum value?';
  }

  feedback.style.display = 'block';
}

// ===================================
// Descriptive Question Evaluation using GEMINI AI
// ===================================

// Create evaluation prompts for each question
const QUESTION_CONTEXTS = {
  question1: {
    question: "You fire two projectiles from ground level with the same initial speed. One is fired at 20° and the other at 70°. Ignoring air resistance, which one will have the greater range? Explain your reasoning.",
    correctAnswer: "Both projectiles will have the SAME range. This is because 20° and 70° are complementary angles (they add up to 90°). According to the range formula R = (v₀² × sin(2θ))/g, complementary angles produce the same value of sin(2θ). Specifically, sin(2×20°) = sin(40°) and sin(2×70°) = sin(140°), and sin(40°) = sin(140°) because sin(180° - x) = sin(x).",
    keyPoints: [
      "Both have the same range",
      "20° and 70° are complementary angles (sum to 90°)",
      "Range formula involves sin(2θ)",
      "Complementary angles give the same range"
    ]
  },
  question2: {
    question: "Imagine you throw a ball horizontally from a tall cliff. At the exact same moment, your friend drops an identical ball from the same height. Which ball hits the ground first? Explain why.",
    correctAnswer: "Both balls hit the ground at the SAME time. This is because horizontal and vertical motions are independent in projectile motion. The vertical motion (falling under gravity) is identical for both balls - they both start from the same height with zero initial vertical velocity. The horizontal velocity of the thrown ball doesn't affect how quickly it falls vertically.",
    keyPoints: [
      "Both hit the ground at the same time",
      "Horizontal and vertical motions are independent",
      "Only vertical motion determines time to hit ground",
      "Both have the same vertical motion (same height, same initial vertical velocity of 0)"
    ]
  }
};

async function evaluateWithGemini(questionId, studentAnswer) {
  try {
    const response = await fetch('/api/gemini/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutorial: 'projectile-motion',
        questionId,
        answer: studentAnswer
      })
    });

    let result = {};
    try {
      result = await response.json();
    } catch {
      // Keep the user-facing error generic if an intermediary returns HTML.
    }

    if (!response.ok) {
      throw new Error(typeof result.error === 'string' ? result.error : 'Evaluation service is unavailable.');
    }
    if (!Number.isInteger(result.score) || result.score < 0 || result.score > 10 || typeof result.feedback !== 'string') {
      throw new Error('Evaluation service returned an invalid response.');
    }

    return { score: result.score, feedback: result.feedback };
  } catch (error) {
    return {
      score: 0,
      feedback: `Error during evaluation: ${error.message}`
    };
  }
}

async function evaluateDescriptiveQuestion1() {
  const textarea = document.getElementById('desc-q1');
  const feedback = document.getElementById('desc-q1-feedback');
  const scoreEl = document.getElementById('desc-q1-score');
  const feedbackText = document.getElementById('desc-q1-feedback-text');
  const submitBtn = document.querySelector('[data-action="evaluate-description-1"]');
  const answer = textarea.value.trim();

  if (!answer) {
    alert('Please provide an answer');
    return;
  }

  // Disable button and show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Evaluating with AI...';
  }

  // Show feedback container with loading message
  feedback.classList.add('visible');
  scoreEl.textContent = 'Evaluating...';
  feedbackText.textContent = 'AI is analyzing your answer. This may take a few seconds...';

  try {
    const result = await evaluateWithGemini('question1', answer);

    // Display results
    scoreEl.textContent = `Score: ${result.score}/10`;
    feedbackText.innerHTML = formatSafeFeedback(result.feedback);

    // Trigger MathJax to render math formulas
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([feedbackText]).catch((err) => console.error('MathJax error:', err));
    }

    // Update total score
    updateScore(result.score);
  } catch (error) {
    scoreEl.textContent = 'Error';
    feedbackText.textContent = `Failed to evaluate: ${error.message}`;
  } finally {
    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit for Evaluation';
    }
  }
}

async function evaluateDescriptiveQuestion2() {
  const textarea = document.getElementById('desc-q2');
  const feedback = document.getElementById('desc-q2-feedback');
  const scoreEl = document.getElementById('desc-q2-score');
  const feedbackText = document.getElementById('desc-q2-feedback-text');
  const submitBtn = document.querySelector('[data-action="evaluate-description-2"]');
  const answer = textarea.value.trim();

  if (!answer) {
    alert('Please provide an answer');
    return;
  }

  // Disable button and show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Evaluating with AI...';
  }

  // Show feedback container with loading message
  feedback.classList.add('visible');
  scoreEl.textContent = 'Evaluating...';
  feedbackText.textContent = 'AI is analyzing your answer. This may take a few seconds...';

  try {
    const result = await evaluateWithGemini('question2', answer);

    // Display results
    scoreEl.textContent = `Score: ${result.score}/10`;
    feedbackText.innerHTML = formatSafeFeedback(result.feedback);

    // Trigger MathJax to render math formulas
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([feedbackText]).catch((err) => console.error('MathJax error:', err));
    }

    // Update total score
    updateScore(result.score);
  } catch (error) {
    scoreEl.textContent = 'Error';
    feedbackText.textContent = `Failed to evaluate: ${error.message}`;
  } finally {
    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit for Evaluation';
    }
  }
}

// ===================================
// Visualization Functionality
// ===================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void initializeVisualizations());
} else {
  void initializeVisualizations();
}

async function initializeVisualizations() {
  // Initialize Static Visualization
  const staticVizContainer = document.getElementById('staticViz');
  if (!staticVizContainer) {
    console.error('Static viz container not found');
    return;
  }
  await whenNearViewport(staticVizContainer);
  let staticToolsManager;

  try {
    staticToolsManager = await ToolsManager.create(staticVizContainer);
    staticToolsManager.registerTool('projectile', Projectile, {
      config: {
        enableZoom: false,
        enableRotate: false,
        enablePan: false,
      }
    });
    staticToolsManager.switchTool('projectile');
    // Set renderer size to match container
    const staticWidth = staticVizContainer.clientWidth;
    const staticHeight = staticVizContainer.clientHeight;
    staticToolsManager.three.renderer.setSize(staticWidth, staticHeight);
    staticToolsManager.three.camera.aspect = staticWidth / staticHeight;
    staticToolsManager.three.camera.updateProjectionMatrix();

    staticToolsManager.startAnimation();
    // Hide the placeholder message
    const placeholder = document.getElementById('staticVizPlaceholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }

    window.staticToolsManager = staticToolsManager;
  } catch (error) {
    console.error('Error initializing static visualization:', error);
    return;
  }

  // Static Visualization Button Handlers
  document.getElementById('btnRunStatic')?.addEventListener('click', () => {
    const v0 = parseFloat(document.getElementById('static-v0').value);
    const theta = parseFloat(document.getElementById('static-angle').value);
    const y0 = parseFloat(document.getElementById('static-y0').value);

    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
    const color = colors[Math.floor(Math.random() * colors.length)];
    try {
      staticToolsManager.executeToolMethod('launch', v0, theta, 0, y0, color);
      // Show animation controls
      document.getElementById('staticSpeedNavControls').style.display = 'flex';
      const staticPlayPauseBtn = document.getElementById('staticPlayPauseBtn');
      const staticReplayBtn = document.getElementById('staticReplayBtn');
      if (staticPlayPauseBtn) staticPlayPauseBtn.style.display = 'flex';
      if (staticReplayBtn) staticReplayBtn.style.display = 'none';
    } catch (error) {
      console.error('Error launching projectile:', error);
    }
  });

  document.getElementById('btnResetStatic')?.addEventListener('click', () => {
    staticToolsManager.resetCurrentTool();
    document.getElementById('static-v0').value = 20;
    document.getElementById('static-angle').value = 45;
    document.getElementById('static-y0').value = 0;
    // Hide animation controls and live values
    document.getElementById('staticSpeedNavControls').style.display = 'none';
    document.getElementById('staticLiveValues').style.display = 'none';
  });

  // Animation control handlers for static visualization
  const staticPlayPauseBtn = document.getElementById('staticPlayPauseBtn');
  const staticReplayBtn = document.getElementById('staticReplayBtn');

  if (staticPlayPauseBtn) {
    staticPlayPauseBtn.addEventListener('click', () => {
      const tool = staticToolsManager.getCurrentTool();
      if (!tool) return;

      const isAnimating = tool.animating || tool.animatingPoint !== null;

      if (!isAnimating) {
        staticToolsManager.executeToolMethod('replayLatest');
        const icon = staticPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
        const staticPrevBtn = document.getElementById('staticPrevBtn');
        const staticNextBtn = document.getElementById('staticNextBtn');
        if (staticPrevBtn) staticPrevBtn.style.display = 'none';
        if (staticNextBtn) staticNextBtn.style.display = 'none';
      } else {
        const newPausedState = !tool.paused;
        staticToolsManager.executeToolMethod('setPaused', newPausedState);
        const icon = staticPlayPauseBtn.querySelector('i');
        if (icon) icon.className = newPausedState ? 'fas fa-play' : 'fas fa-pause';
        const staticPrevBtn = document.getElementById('staticPrevBtn');
        const staticNextBtn = document.getElementById('staticNextBtn');
        if (staticPrevBtn) staticPrevBtn.style.display = newPausedState ? 'flex' : 'none';
        if (staticNextBtn) staticNextBtn.style.display = newPausedState ? 'flex' : 'none';
      }
    });
  }

  if (staticReplayBtn) {
    staticReplayBtn.addEventListener('click', () => {
      staticToolsManager.executeToolMethod('replayLatest');
      if (staticPlayPauseBtn) {
        staticPlayPauseBtn.style.display = 'flex';
        const icon = staticPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
      }
      if (staticReplayBtn) staticReplayBtn.style.display = 'none';
    });
  }

  // Speed control for static visualization
  const staticSpeedSelect = document.getElementById('staticSpeedSelect');
  if (staticSpeedSelect) {
    staticSpeedSelect.addEventListener('change', (e) => {
      const speed = parseFloat(e.target.value);
      const tool = staticToolsManager.getCurrentTool();
      if (tool && tool.setAnimationSpeed) {
        tool.setAnimationSpeed(speed);
      }
    });
  }

  // Navigation buttons for static visualization
  const staticPrevBtn = document.getElementById('staticPrevBtn');
  const staticNextBtn = document.getElementById('staticNextBtn');

  if (staticPrevBtn) {
    staticPrevBtn.addEventListener('click', () => {
      staticToolsManager.executeToolMethod('moveLatestObject', 'left');
    });
  }

  if (staticNextBtn) {
    staticNextBtn.addEventListener('click', () => {
      staticToolsManager.executeToolMethod('moveLatestObject', 'right');
    });
  }

  // Initialize Example 1 Visualization
  const example1VizContainer = document.getElementById('example1Viz');
  if (!example1VizContainer) {
    console.error('Example1 viz container not found');
    return;
  }

  const example1ToolsManager = await ToolsManager.create(example1VizContainer);

  example1ToolsManager.registerTool('projectile', Projectile, {
    config: {
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
    }
  });

  example1ToolsManager.switchTool('projectile');

  // Set renderer size to match container
  const example1Width = example1VizContainer.clientWidth;
  const example1Height = example1VizContainer.clientHeight;
  example1ToolsManager.three.renderer.setSize(example1Width, example1Height);
  example1ToolsManager.three.camera.aspect = example1Width / example1Height;
  example1ToolsManager.three.camera.updateProjectionMatrix();

  example1ToolsManager.startAnimation();

  // Hide the placeholder message
  const example1Placeholder = document.getElementById('example1VizPlaceholder');
  if (example1Placeholder) {
    example1Placeholder.style.display = 'none';
  }

  window.example1ToolsManager = example1ToolsManager;

  // Example 1 Visualization Button Handlers
  document.getElementById('btnRunExample1')?.addEventListener('click', () => {
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
    const color = colors[Math.floor(Math.random() * colors.length)];
    // Parameters from example: v0=100 m/s, angle=30°, y0=0
    example1ToolsManager.executeToolMethod('launch', 100, 30, 0, 0, color);

    // Show animation controls
    document.getElementById('example1SpeedNavControls').style.display = 'flex';
    const example1PlayPauseBtn = document.getElementById('example1PlayPauseBtn');
    const example1ReplayBtn = document.getElementById('example1ReplayBtn');
    if (example1PlayPauseBtn) example1PlayPauseBtn.style.display = 'flex';
    if (example1ReplayBtn) example1ReplayBtn.style.display = 'none';
  });

  document.getElementById('btnResetExample1')?.addEventListener('click', () => {
    example1ToolsManager.resetCurrentTool();
    // Hide animation controls and live values
    document.getElementById('example1SpeedNavControls').style.display = 'none';
    document.getElementById('example1LiveValues').style.display = 'none';
  });

  // Animation control handlers for example1 visualization
  const example1PlayPauseBtn = document.getElementById('example1PlayPauseBtn');
  const example1ReplayBtn = document.getElementById('example1ReplayBtn');

  if (example1PlayPauseBtn) {
    example1PlayPauseBtn.addEventListener('click', () => {
      const tool = example1ToolsManager.getCurrentTool();
      if (!tool) return;

      const isAnimating = tool.animating || tool.animatingPoint !== null;

      if (!isAnimating) {
        example1ToolsManager.executeToolMethod('replayLatest');
        const icon = example1PlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
        const example1PrevBtn = document.getElementById('example1PrevBtn');
        const example1NextBtn = document.getElementById('example1NextBtn');
        if (example1PrevBtn) example1PrevBtn.style.display = 'none';
        if (example1NextBtn) example1NextBtn.style.display = 'none';
      } else {
        const newPausedState = !tool.paused;
        example1ToolsManager.executeToolMethod('setPaused', newPausedState);
        const icon = example1PlayPauseBtn.querySelector('i');
        if (icon) icon.className = newPausedState ? 'fas fa-play' : 'fas fa-pause';
        const example1PrevBtn = document.getElementById('example1PrevBtn');
        const example1NextBtn = document.getElementById('example1NextBtn');
        if (example1PrevBtn) example1PrevBtn.style.display = newPausedState ? 'flex' : 'none';
        if (example1NextBtn) example1NextBtn.style.display = newPausedState ? 'flex' : 'none';
      }
    });
  }

  if (example1ReplayBtn) {
    example1ReplayBtn.addEventListener('click', () => {
      example1ToolsManager.executeToolMethod('replayLatest');
      if (example1PlayPauseBtn) {
        example1PlayPauseBtn.style.display = 'flex';
        const icon = example1PlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
      }
      if (example1ReplayBtn) example1ReplayBtn.style.display = 'none';
    });
  }

  // Speed control for example1 visualization
  const example1SpeedSelect = document.getElementById('example1SpeedSelect');
  if (example1SpeedSelect) {
    example1SpeedSelect.addEventListener('change', (e) => {
      const speed = parseFloat(e.target.value);
      const tool = example1ToolsManager.getCurrentTool();
      if (tool && tool.setAnimationSpeed) {
        tool.setAnimationSpeed(speed);
      }
    });
  }

  // Navigation buttons for example1 visualization
  const example1PrevBtn = document.getElementById('example1PrevBtn');
  const example1NextBtn = document.getElementById('example1NextBtn');

  if (example1PrevBtn) {
    example1PrevBtn.addEventListener('click', () => {
      example1ToolsManager.executeToolMethod('moveLatestObject', 'left');
    });
  }

  if (example1NextBtn) {
    example1NextBtn.addEventListener('click', () => {
      example1ToolsManager.executeToolMethod('moveLatestObject', 'right');
    });
  }

  // ============================================
  // Chat System Integration
  // ============================================

  // Initialize separate tools manager for chat visualization
  const chatVizContainer = document.getElementById('chatVisualization');
  if (!chatVizContainer) {
    console.error('Chat viz container not found');
    return;
  }

  const chatToolsManager = await ToolsManager.create(chatVizContainer);

  // Register tools for chat
  chatToolsManager.registerTool('projectile', Projectile, {
    config: {
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
    }
  });

  chatToolsManager.registerTool('2dgraph', Graph2D, {
    config: {
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
    }
  });

  // Initialize tool definitions for chat (registers with tool registry)
  initializeToolDefinitions(chatToolsManager);

  // Switch to projectile tool
  chatToolsManager.switchTool('projectile');
  chatToolsManager.startAnimation();

  // Make chat tools manager available globally
  window.chatToolsManager = chatToolsManager;

  // ============================================
  // Chat Visualization Control Handlers
  // ============================================

  // Animation control handlers for chat visualization
  const chatPlayPauseBtn = document.getElementById('chatPlayPauseBtn');
  const chatReplayBtn = document.getElementById('chatReplayBtn');

  if (chatPlayPauseBtn) {
    chatPlayPauseBtn.addEventListener('click', () => {
      const tool = chatToolsManager.getCurrentTool();
      if (!tool) return;

      const isAnimating = tool.animating || tool.animatingPoint !== null;

      if (!isAnimating) {
        chatToolsManager.executeToolMethod('replayLatest');
        const icon = chatPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
        const chatPrevBtn = document.getElementById('chatPrevBtn');
        const chatNextBtn = document.getElementById('chatNextBtn');
        if (chatPrevBtn) chatPrevBtn.style.display = 'none';
        if (chatNextBtn) chatNextBtn.style.display = 'none';
      } else {
        const newPausedState = !tool.paused;
        chatToolsManager.executeToolMethod('setPaused', newPausedState);
        const icon = chatPlayPauseBtn.querySelector('i');
        if (icon) icon.className = newPausedState ? 'fas fa-play' : 'fas fa-pause';
        const chatPrevBtn = document.getElementById('chatPrevBtn');
        const chatNextBtn = document.getElementById('chatNextBtn');
        if (chatPrevBtn) chatPrevBtn.style.display = newPausedState ? 'flex' : 'none';
        if (chatNextBtn) chatNextBtn.style.display = newPausedState ? 'flex' : 'none';
      }
    });
  }

  if (chatReplayBtn) {
    chatReplayBtn.addEventListener('click', () => {
      chatToolsManager.executeToolMethod('replayLatest');
      if (chatPlayPauseBtn) {
        chatPlayPauseBtn.style.display = 'flex';
        const icon = chatPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
      }
      if (chatReplayBtn) chatReplayBtn.style.display = 'none';
    });
  }

  // Speed control for chat visualization
  const chatSpeedSelect = document.getElementById('chatSpeedSelect');
  if (chatSpeedSelect) {
    chatSpeedSelect.addEventListener('change', (e) => {
      const speed = parseFloat(e.target.value);
      const tool = chatToolsManager.getCurrentTool();
      if (tool && tool.setAnimationSpeed) {
        tool.setAnimationSpeed(speed);
      }
    });
  }

  // Navigation buttons for chat visualization
  const chatPrevBtn = document.getElementById('chatPrevBtn');
  const chatNextBtn = document.getElementById('chatNextBtn');

  if (chatPrevBtn) {
    chatPrevBtn.addEventListener('click', () => {
      chatToolsManager.executeToolMethod('moveLatestObject', 'left');
    });
  }

  if (chatNextBtn) {
    chatNextBtn.addEventListener('click', () => {
      chatToolsManager.executeToolMethod('moveLatestObject', 'right');
    });
  }

  try {
    window.chatController = new ChatController({
      toolsManager: chatToolsManager,
      tutorialContext: 'projectile-motion'
    });
  } catch (error) {
    console.error('Failed to initialize chat:', error);
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'message assistant';
      errorMsg.textContent = 'Failed to initialize chat.';
      chatMessages.appendChild(errorMsg);
    }
  }

}

// ===================================
// Live Values Display Helper Functions
// ===================================

// For Static Visualization
window.updateLiveValuesStatic = (x, y, vx, vy) => {
  const liveX = document.getElementById('staticLiveX');
  const liveY = document.getElementById('staticLiveY');
  const liveV = document.getElementById('staticLiveV');
  const liveVelocity = document.getElementById('staticLiveVelocity');

  if (liveX) liveX.textContent = x.toFixed(2);
  if (liveY) liveY.textContent = y.toFixed(2);

  if (vx !== undefined && vy !== undefined && liveV && liveVelocity) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    liveV.textContent = speed.toFixed(2);
    liveVelocity.style.display = 'flex';
  } else if (liveVelocity) {
    liveVelocity.style.display = 'none';
  }
};

window.showLiveValuesStatic = () => {
  const liveValues = document.getElementById('staticLiveValues');
  if (liveValues) {
    liveValues.style.display = 'flex';
  }
};

window.hideLiveValuesStatic = () => {
  const liveValues = document.getElementById('staticLiveValues');
  if (liveValues) {
    liveValues.style.display = 'none';
  }
};

// For Example1 Visualization
window.updateLiveValuesExample1 = (x, y, vx, vy) => {
  const liveX = document.getElementById('example1LiveX');
  const liveY = document.getElementById('example1LiveY');
  const liveV = document.getElementById('example1LiveV');
  const liveVelocity = document.getElementById('example1LiveVelocity');

  if (liveX) liveX.textContent = x.toFixed(2);
  if (liveY) liveY.textContent = y.toFixed(2);

  if (vx !== undefined && vy !== undefined && liveV && liveVelocity) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    liveV.textContent = speed.toFixed(2);
    liveVelocity.style.display = 'flex';
  } else if (liveVelocity) {
    liveVelocity.style.display = 'none';
  }
};

window.showLiveValuesExample1 = () => {
  const liveValues = document.getElementById('example1LiveValues');
  if (liveValues) {
    liveValues.style.display = 'flex';
  }
};

window.hideLiveValuesExample1 = () => {
  const liveValues = document.getElementById('example1LiveValues');
  if (liveValues) {
    liveValues.style.display = 'none';
  }
};

// For Chat Visualization
window.updateLiveValuesChat = (x, y, vx, vy) => {
  const liveX = document.getElementById('chatLiveX');
  const liveY = document.getElementById('chatLiveY');
  const liveV = document.getElementById('chatLiveV');
  const liveVelocity = document.getElementById('chatLiveVelocity');

  if (liveX) liveX.textContent = x.toFixed(2);
  if (liveY) liveY.textContent = y.toFixed(2);

  if (vx !== undefined && vy !== undefined && liveV && liveVelocity) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    liveV.textContent = speed.toFixed(2);
    liveVelocity.style.display = 'flex';
  } else if (liveVelocity) {
    liveVelocity.style.display = 'none';
  }
};

window.showLiveValuesChat = () => {
  const liveValues = document.getElementById('chatLiveValues');
  if (liveValues) {
    liveValues.style.display = 'flex';
  }
};

window.hideLiveValuesChat = () => {
  const liveValues = document.getElementById('chatLiveValues');
  if (liveValues) {
    liveValues.style.display = 'none';
  }
};

// Generic functions that tools will call
window.updateLiveValues = (x, y, vx, vy) => {
  window.updateLiveValuesStatic(x, y, vx, vy);
  window.updateLiveValuesExample1(x, y, vx, vy);
  window.updateLiveValuesChat(x, y, vx, vy);
};

window.showLiveValues = () => {
  window.showLiveValuesStatic();
  window.showLiveValuesExample1();
  window.showLiveValuesChat();
};

window.hideLiveValues = () => {
  window.hideLiveValuesStatic();
  window.hideLiveValuesExample1();
  window.hideLiveValuesChat();
};

// Global helper functions that tools can call
window.showControls = () => {
  // Static visualization controls
  const staticControls = document.getElementById('staticSpeedNavControls');
  const staticPlayPause = document.getElementById('staticPlayPauseBtn');
  const staticReplay = document.getElementById('staticReplayBtn');

  if (staticControls) staticControls.style.display = 'flex';
  if (staticPlayPause) staticPlayPause.style.display = 'flex';
  if (staticReplay) staticReplay.style.display = 'none';

  // Example1 visualization controls
  const example1Controls = document.getElementById('example1SpeedNavControls');
  const example1PlayPause = document.getElementById('example1PlayPauseBtn');
  const example1Replay = document.getElementById('example1ReplayBtn');

  if (example1Controls) example1Controls.style.display = 'flex';
  if (example1PlayPause) example1PlayPause.style.display = 'flex';
  if (example1Replay) example1Replay.style.display = 'none';

  // Chat visualization controls
  const chatPlayPause = document.getElementById('chatPlayPauseBtn');
  const chatReplay = document.getElementById('chatReplayBtn');

  if (chatPlayPause) chatPlayPause.style.display = 'flex';
  if (chatReplay) chatReplay.style.display = 'none';

  // Hide navigation arrows during animation
  const staticPrevBtn = document.getElementById('staticPrevBtn');
  const staticNextBtn = document.getElementById('staticNextBtn');
  const example1PrevBtn = document.getElementById('example1PrevBtn');
  const example1NextBtn = document.getElementById('example1NextBtn');
  const chatPrevBtn = document.getElementById('chatPrevBtn');
  const chatNextBtn = document.getElementById('chatNextBtn');

  if (staticPrevBtn) staticPrevBtn.style.display = 'none';
  if (staticNextBtn) staticNextBtn.style.display = 'none';
  if (example1PrevBtn) example1PrevBtn.style.display = 'none';
  if (example1NextBtn) example1NextBtn.style.display = 'none';
  if (chatPrevBtn) chatPrevBtn.style.display = 'none';
  if (chatNextBtn) chatNextBtn.style.display = 'none';
};

window.showFinishedControls = () => {
  // Static visualization controls
  const staticControls = document.getElementById('staticSpeedNavControls');
  const staticPlayPause = document.getElementById('staticPlayPauseBtn');
  const staticReplay = document.getElementById('staticReplayBtn');

  if (staticControls) staticControls.style.display = 'flex';
  if (staticPlayPause) staticPlayPause.style.display = 'none';
  if (staticReplay) staticReplay.style.display = 'flex';

  // Example1 visualization controls
  const example1Controls = document.getElementById('example1SpeedNavControls');
  const example1PlayPause = document.getElementById('example1PlayPauseBtn');
  const example1Replay = document.getElementById('example1ReplayBtn');

  if (example1Controls) example1Controls.style.display = 'flex';
  if (example1PlayPause) example1PlayPause.style.display = 'none';
  if (example1Replay) example1Replay.style.display = 'flex';

  // Chat visualization controls
  const chatPlayPause = document.getElementById('chatPlayPauseBtn');
  const chatReplay = document.getElementById('chatReplayBtn');

  if (chatPlayPause) chatPlayPause.style.display = 'none';
  if (chatReplay) chatReplay.style.display = 'flex';

  // Show navigation arrows when animation is finished
  const staticPrevBtn = document.getElementById('staticPrevBtn');
  const staticNextBtn = document.getElementById('staticNextBtn');
  const example1PrevBtn = document.getElementById('example1PrevBtn');
  const example1NextBtn = document.getElementById('example1NextBtn');
  const chatPrevBtn = document.getElementById('chatPrevBtn');
  const chatNextBtn = document.getElementById('chatNextBtn');

  if (staticPrevBtn) staticPrevBtn.style.display = 'flex';
  if (staticNextBtn) staticNextBtn.style.display = 'flex';
  if (example1PrevBtn) example1PrevBtn.style.display = 'flex';
  if (example1NextBtn) example1NextBtn.style.display = 'flex';
  if (chatPrevBtn) chatPrevBtn.style.display = 'flex';
  if (chatNextBtn) chatNextBtn.style.display = 'flex';
};

// ===================================
// Initialize
// ===================================

const actionHandlers = {
  'check-quiz-1': checkQuizQuestion1,
  'check-quiz-2': checkQuizQuestion2,
  'check-quiz-3': checkQuizQuestion3,
  'evaluate-description-1': evaluateDescriptiveQuestion1,
  'evaluate-description-2': evaluateDescriptiveQuestion2
};

document.querySelectorAll('[data-action]').forEach(element => {
  const handler = actionHandlers[element.dataset.action];
  if (handler) element.addEventListener('click', handler);
});

document.getElementById('btnTOC')?.addEventListener('click', toggleTOC);
document.getElementById('btnAI')?.addEventListener('click', scrollToChat);

document.querySelectorAll('#tocPanel a[href^="#section-"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    scrollToSection(link.hash.slice('#section-'.length));
  });
});

// Close TOC when clicking outside
document.addEventListener('click', (e) => {
  const tocPanel = document.getElementById('tocPanel');
  const tocBtn = document.getElementById('btnTOC');

  if (tocPanel.classList.contains('active') && !tocPanel.contains(e.target) && !tocBtn.contains(e.target)) {
    tocPanel.classList.remove('active');
  }
});
