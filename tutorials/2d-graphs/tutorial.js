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
    title: "Golden Ratio",
    content: "The Golden Ratio φ (phi) ≈ 1.618... appears everywhere in nature, art, and architecture! From the spirals of shells to the proportions of the Parthenon, this magical number has fascinated mathematicians and artists for millennia.",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    title: "Cartesian System",
    content: "René Descartes revolutionized mathematics by connecting algebra and geometry! His coordinate system allows us to represent any point in space with numbers, making complex problems visual and solvable.",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    title: "Pi's Mystery",
    content: "π has been calculated to over 62 trillion digits - and still no repeating pattern has been found! This mysterious number appears in circles, waves, and even probability theory. Every circle in the universe shares this same ratio!",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    title: "Euler's Identity",
    content: "e^(iπ) + 1 = 0 is called 'the most beautiful equation in mathematics.' It connects five fundamental constants: e, i, π, 1, and 0. This simple formula unites algebra, geometry, and calculus in perfect harmony!",
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    title: "Fibonacci Spiral",
    content: "The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13...) appears throughout nature! Sunflowers typically have 55 or 89 spirals, pinecones follow the pattern, and even galaxies form Fibonacci spirals. Nature is a mathematician!",
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    title: "Pythagoras' Secret",
    content: "The famous theorem a² + b² = c² wasn't actually discovered by Pythagoras! Babylonian clay tablets show they knew this relationship 1,000 years before he was born. But Pythagoras gets the credit for proving it!",
    background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
  },
  {
    title: "Zero's Journey",
    content: "Zero was invented in India around 500 CE and revolutionized mathematics! Before zero, arithmetic was incredibly difficult. This 'nothing' became something that changed everything - from calculus to computers!",
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  },
  {
    title: "Infinity Paradox",
    content: "Some infinities are bigger than others - mind-blowing but true! The infinity of real numbers is larger than the infinity of integers. Mathematician Georg Cantor proved this and it nearly drove him mad!",
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
  },
  {
    title: "Fractal Magic",
    content: "The Mandelbrot set shows infinite complexity from the simple equation z = z² + c. Zoom in forever and you'll keep finding new patterns! Fractals model everything from coastlines to stock markets.",
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
  },
  {
    title: "Prime Mystery",
    content: "The largest known prime number has 24 million digits - discovered in 2018! Primes are the 'atoms' of mathematics, and we still don't fully understand their distribution. The search continues!",
    background: "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)"
  },
  {
    title: "Bridges Problem",
    content: "Euler solved the Seven Bridges of Königsberg problem in 1736, creating graph theory! He proved you can't walk across all seven bridges exactly once. This 'impossible' problem birthed a whole new branch of mathematics!",
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
let totalSections = 10;

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
  const chatSection = document.getElementById('section-10');
  if (chatSection) {
    chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ===================================
// Quiz Question Handlers
// ===================================

// Question 1: In which quadrant is the point (-4, 3) located?
function checkQuizQuestion1() {
  const selected = document.querySelector('input[name="q1"]:checked');
  const feedback = document.getElementById('q1-feedback');
  const feedbackText = document.getElementById('q1-feedback-text');

  if (!selected) {
    alert('Please select an answer');
    return;
  }

  const answer = selected.value;

  // Correct answer: Quadrant II (negative x, positive y)
  if (answer === 'II') {
    feedback.className = 'quiz-feedback correct';
    feedbackText.innerHTML = '<strong>✓ Correct!</strong><br>Point (-4, 3) is in Quadrant II because the x-coordinate is negative and the y-coordinate is positive. Quadrant II is the upper-left region of the coordinate plane.';
    updateScore(10);
  } else {
    feedback.className = 'quiz-feedback incorrect';
    feedbackText.innerHTML = '<strong>✗ Incorrect.</strong><br>Remember: Quadrant I (+, +), Quadrant II (-, +), Quadrant III (-, -), Quadrant IV (+, -). Where does (-4, 3) belong?';
  }

  feedback.style.display = 'block';
}

// Question 2: What are the coordinates of the origin?
function checkQuizQuestion2() {
  const input = document.getElementById('q2-input');
  const feedback = document.getElementById('q2-feedback');
  const feedbackText = document.getElementById('q2-feedback-text');
  const answer = input.value.trim().toLowerCase();

  // Accept various formats: "0", "(0, 0)", "0, 0", "(0,0)", "0,0"
  const validAnswers = ['0', '(0, 0)', '0, 0', '(0,0)', '0,0'];
  const isCorrect = validAnswers.includes(answer) || answer === '0';

  if (isCorrect) {
    feedback.className = 'quiz-feedback correct';
    feedbackText.innerHTML = '<strong>✓ Correct!</strong><br>The origin is at coordinates (0, 0), where the x-axis and y-axis intersect. This is the center point of the coordinate plane.';
    updateScore(10);
  } else {
    feedback.className = 'quiz-feedback incorrect';
    feedbackText.innerHTML = '<strong>✗ Incorrect.</strong><br>The origin is the point where the x-axis and y-axis meet. Both coordinates are zero at this point.';
  }

  feedback.style.display = 'block';
}

// Question 3: Which quadrant has positive x and negative y values?
function checkQuizQuestion3() {
  const selected = document.querySelector('input[name="q3"]:checked');
  const feedback = document.getElementById('q3-feedback');
  const feedbackText = document.getElementById('q3-feedback-text');

  if (!selected) {
    alert('Please select an answer');
    return;
  }

  const answer = selected.value;

  if (answer === 'IV') {
    feedback.className = 'quiz-feedback correct';
    feedbackText.innerHTML = '<strong>✓ Correct!</strong><br>Quadrant IV has positive x-coordinates and negative y-coordinates. It is the lower-right region of the coordinate plane.';
    updateScore(10);
  } else {
    feedback.className = 'quiz-feedback incorrect';
    feedbackText.innerHTML = '<strong>✗ Incorrect.</strong><br>Think about which quadrant is in the lower-right of the plane. Remember: Quadrant I (+, +), Quadrant II (-, +), Quadrant III (-, -), Quadrant IV (+, -).';
  }

  feedback.style.display = 'block';
}

// ===================================
// Descriptive Question Evaluation using GEMINI AI
// ===================================

// Create evaluation prompts for each question
const QUESTION_CONTEXTS = {
  question1: {
    question: "Describe the step-by-step process to plot the point (5, -3) on a coordinate plane. Explain what each coordinate represents and which quadrant this point belongs to.",
    correctAnswer: "To plot point (5, -3): First, identify the coordinates - x = 5 and y = -3. The x-coordinate (5) tells us to move 5 units to the right from the origin, since it's positive. The y-coordinate (-3) tells us to move 3 units down from there, since it's negative. Start at the origin (0, 0), move 5 units right along the x-axis, then move 3 units down parallel to the y-axis, and mark the point. This point is in Quadrant IV because it has a positive x-coordinate and negative y-coordinate. Quadrant IV is the lower-right region of the coordinate plane.",
    keyPoints: [
      "Identify x and y coordinates correctly (x = 5, y = -3)",
      "Explain x-coordinate means horizontal movement (right for positive)",
      "Explain y-coordinate means vertical movement (down for negative)",
      "Step-by-step plotting process from origin",
      "Correctly identify Quadrant IV",
      "Understanding what positive/negative coordinates mean directionally"
    ]
  },
  question2: {
    question: "List and explain three real-world applications where coordinate systems are essential. For each application, describe how points, distances, or positions are represented using coordinates.",
    correctAnswer: "1) GPS Navigation: Uses latitude and longitude coordinates to pinpoint exact locations on Earth. Each position is a point (lat, long), and distances between points help calculate routes and travel times. 2) Computer Graphics/Gaming: Every pixel on screen has (x, y) coordinates. Objects are positioned, moved, and animated by changing their coordinate values. Distance formulas determine collisions and proximity. 3) Architecture/Engineering: Building plans use coordinate systems to specify exact positions of walls, doors, windows. Coordinates ensure precise measurements and proper alignment. Other valid examples: maps (reading locations), robotics (positioning robot arms), medical imaging (CT/MRI scans locate points in body), flight control (aircraft position in 3D space), astronomy (star positions), data visualization (plotting graphs).",
    keyPoints: [
      "Three distinct real-world applications identified",
      "Clear explanation of how coordinates are used in each",
      "Understanding of position/location representation",
      "Mention of practical benefits (navigation, measurement, precision, etc.)",
      "Examples could include: GPS, graphics, architecture, maps, robotics, medical imaging, astronomy",
      "Explanation of distances or relationships between points"
    ]
  }
};

async function evaluateWithGemini(questionId, studentAnswer) {
  try {
    const response = await fetch('/api/gemini/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutorial: '2d-graphs',
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
  // Initialize Point Visualization
  const pointVizContainer = document.getElementById('pointViz');
  if (!pointVizContainer) {
    console.error('Point viz container not found');
    return;
  }
  await whenNearViewport(pointVizContainer);
  let pointToolsManager;

  try {
    pointToolsManager = await ToolsManager.create(pointVizContainer);
    pointToolsManager.registerTool('2dgraph', Graph2D, {
      config: {
        enableZoom: false,
        enableRotate: false,
        enablePan: false,
      }
    });
    pointToolsManager.switchTool('2dgraph');
    // Set renderer size to match container
    const pointWidth = pointVizContainer.clientWidth;
    const pointHeight = pointVizContainer.clientHeight;
    pointToolsManager.three.renderer.setSize(pointWidth, pointHeight);
    pointToolsManager.three.camera.aspect = pointWidth / pointHeight;
    pointToolsManager.three.camera.updateProjectionMatrix();

    pointToolsManager.startAnimation();
    // Hide the placeholder message
    const placeholder = document.getElementById('pointVizPlaceholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }

    window.pointToolsManager = pointToolsManager;
  } catch (error) {
    console.error('Error initializing point visualization:', error);
    return;
  }

  // Point Visualization Button Handlers
  document.getElementById('btnPlotPoint')?.addEventListener('click', () => {
    const x = parseFloat(document.getElementById('point-x').value);
    const y = parseFloat(document.getElementById('point-y').value);

    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
    const color = colors[Math.floor(Math.random() * colors.length)];
    try {
      pointToolsManager.executeToolMethod('addPoint', x, y, color);
      // Calculate distance from origin
      const distance = Math.sqrt(x * x + y * y).toFixed(2);

      // Determine quadrant
      let quadrant;
      if (x > 0 && y > 0) quadrant = 'I';
      else if (x < 0 && y > 0) quadrant = 'II';
      else if (x < 0 && y < 0) quadrant = 'III';
      else if (x > 0 && y < 0) quadrant = 'IV';
      else if (x === 0 && y === 0) quadrant = 'Origin';
      else if (x === 0) quadrant = 'Y-axis';
      else quadrant = 'X-axis';

      // Update info display
      const infoDisplay = document.getElementById('pointInfo');
      if (infoDisplay) {
        infoDisplay.innerHTML = `
          <strong>Point Information:</strong><br>
          Coordinates: (${x}, ${y})<br>
          Quadrant: ${quadrant}<br>
          Distance from origin: ${distance} units
        `;
        infoDisplay.style.display = 'block';
      }

      // Show animation controls
      document.getElementById('pointSpeedNavControls').style.display = 'flex';
      const pointPlayPauseBtn = document.getElementById('pointPlayPauseBtn');
      const pointReplayBtn = document.getElementById('pointReplayBtn');
      if (pointPlayPauseBtn) pointPlayPauseBtn.style.display = 'flex';
      if (pointReplayBtn) pointReplayBtn.style.display = 'none';
    } catch (error) {
      console.error('Error plotting point:', error);
    }
  });

  document.getElementById('btnResetPoint')?.addEventListener('click', () => {
    pointToolsManager.resetCurrentTool();
    document.getElementById('point-x').value = 3;
    document.getElementById('point-y').value = 4;
    // Hide animation controls, live values, and point info
    document.getElementById('pointSpeedNavControls').style.display = 'none';
    document.getElementById('pointLiveValues').style.display = 'none';
    const infoDisplay = document.getElementById('pointInfo');
    if (infoDisplay) infoDisplay.style.display = 'none';
  });

  // Animation control handlers for point visualization
  const pointPlayPauseBtn = document.getElementById('pointPlayPauseBtn');
  const pointReplayBtn = document.getElementById('pointReplayBtn');

  if (pointPlayPauseBtn) {
    pointPlayPauseBtn.addEventListener('click', () => {
      const tool = pointToolsManager.getCurrentTool();
      if (!tool) return;

      const isAnimating = tool.animating || tool.animatingPoint !== null;

      if (!isAnimating) {
        pointToolsManager.executeToolMethod('replayLatest');
        const icon = pointPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
        const pointPrevBtn = document.getElementById('pointPrevBtn');
        const pointNextBtn = document.getElementById('pointNextBtn');
        if (pointPrevBtn) pointPrevBtn.style.display = 'none';
        if (pointNextBtn) pointNextBtn.style.display = 'none';
      } else {
        const newPausedState = !tool.paused;
        pointToolsManager.executeToolMethod('setPaused', newPausedState);
        const icon = pointPlayPauseBtn.querySelector('i');
        if (icon) icon.className = newPausedState ? 'fas fa-play' : 'fas fa-pause';
        const pointPrevBtn = document.getElementById('pointPrevBtn');
        const pointNextBtn = document.getElementById('pointNextBtn');
        if (pointPrevBtn) pointPrevBtn.style.display = newPausedState ? 'flex' : 'none';
        if (pointNextBtn) pointNextBtn.style.display = newPausedState ? 'flex' : 'none';
      }
    });
  }

  if (pointReplayBtn) {
    pointReplayBtn.addEventListener('click', () => {
      pointToolsManager.executeToolMethod('replayLatest');
      if (pointPlayPauseBtn) {
        pointPlayPauseBtn.style.display = 'flex';
        const icon = pointPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
      }
      if (pointReplayBtn) pointReplayBtn.style.display = 'none';
    });
  }

  // Speed control for point visualization
  const pointSpeedSelect = document.getElementById('pointSpeedSelect');
  if (pointSpeedSelect) {
    pointSpeedSelect.addEventListener('change', (e) => {
      const speed = parseFloat(e.target.value);
      const tool = pointToolsManager.getCurrentTool();
      if (tool && tool.setAnimationSpeed) {
        tool.setAnimationSpeed(speed);
      }
    });
  }

  // Navigation buttons for point visualization
  const pointPrevBtn = document.getElementById('pointPrevBtn');
  const pointNextBtn = document.getElementById('pointNextBtn');

  if (pointPrevBtn) {
    pointPrevBtn.addEventListener('click', () => {
      pointToolsManager.executeToolMethod('moveLatestObject', 'left');
    });
  }

  if (pointNextBtn) {
    pointNextBtn.addEventListener('click', () => {
      pointToolsManager.executeToolMethod('moveLatestObject', 'right');
    });
  }

  // Initialize Example 1 Visualization
  const example1VizContainer = document.getElementById('example1Viz');
  if (!example1VizContainer) {
    console.error('Example1 viz container not found');
  } else {

  const example1ToolsManager = await ToolsManager.create(example1VizContainer);

  example1ToolsManager.registerTool('2dgraph', Graph2D, {
    config: {
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
    }
  });

  example1ToolsManager.switchTool('2dgraph');

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
    // Example: Plot point (3, 4)
    example1ToolsManager.executeToolMethod('addPoint', 3, 4, color);

    // Show animation controls
    document.getElementById('example1AnimationControls').style.display = 'flex';
    const example1PlayPauseBtn = document.getElementById('example1PlayPauseBtn');
    const example1ReplayBtn = document.getElementById('example1ReplayBtn');
    if (example1PlayPauseBtn) example1PlayPauseBtn.style.display = 'flex';
    if (example1ReplayBtn) example1ReplayBtn.style.display = 'none';
  });

  document.getElementById('btnResetExample1')?.addEventListener('click', () => {
    example1ToolsManager.resetCurrentTool();
    // Hide animation controls and live values
    document.getElementById('example1AnimationControls').style.display = 'none';
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
  } // End of example1 visualization

  // ============================================
  // Comparison Visualization (Example 4)
  // ============================================

  // Initialize Comparison Visualization
  const comparisonVizContainer = document.getElementById('comparisonViz');
  if (!comparisonVizContainer) {
    console.error('Comparison viz container not found');
  } else {

  const comparisonToolsManager = await ToolsManager.create(comparisonVizContainer);

  comparisonToolsManager.registerTool('2dgraph', Graph2D, {
    config: {
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
    }
  });

  comparisonToolsManager.switchTool('2dgraph');

  // Set renderer size to match container
  const comparisonWidth = comparisonVizContainer.clientWidth;
  const comparisonHeight = comparisonVizContainer.clientHeight;
  comparisonToolsManager.three.renderer.setSize(comparisonWidth, comparisonHeight);
  comparisonToolsManager.three.camera.aspect = comparisonWidth / comparisonHeight;
  comparisonToolsManager.three.camera.updateProjectionMatrix();

  comparisonToolsManager.startAnimation();

  // Hide the placeholder message
  const comparisonPlaceholder = document.getElementById('comparisonVizPlaceholder');
  if (comparisonPlaceholder) {
    comparisonPlaceholder.style.display = 'none';
  }

  window.comparisonToolsManager = comparisonToolsManager;

  // Comparison Visualization Button Handlers
  document.getElementById('btnShowComparison')?.addEventListener('click', () => {
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12];

    // Plot all four points: (2,3), (-2,3), (-2,-3), (2,-3)
    const points = [
      { x: 2, y: 3, color: colors[0] },
      { x: -2, y: 3, color: colors[1] },
      { x: -2, y: -3, color: colors[2] },
      { x: 2, y: -3, color: colors[3] }
    ];
    // Plot each point with a slight delay for visual effect
    points.forEach((point, index) => {
      setTimeout(() => {
        comparisonToolsManager.executeToolMethod('addPoint', point.x, point.y, point.color);
      }, index * 500);
    });

    // Show animation controls after all points are plotted
    setTimeout(() => {
      document.getElementById('comparisonSpeedNavControls').style.display = 'flex';
      const comparisonPlayPauseBtn = document.getElementById('comparisonPlayPauseBtn');
      const comparisonReplayBtn = document.getElementById('comparisonReplayBtn');
      if (comparisonPlayPauseBtn) comparisonPlayPauseBtn.style.display = 'flex';
      if (comparisonReplayBtn) comparisonReplayBtn.style.display = 'none';
    }, points.length * 500);
  });

  document.getElementById('btnResetComparison')?.addEventListener('click', () => {
    comparisonToolsManager.resetCurrentTool();
    // Hide animation controls
    document.getElementById('comparisonSpeedNavControls').style.display = 'none';
  });

  // Animation control handlers for comparison visualization
  const comparisonPlayPauseBtn = document.getElementById('comparisonPlayPauseBtn');
  const comparisonReplayBtn = document.getElementById('comparisonReplayBtn');

  if (comparisonPlayPauseBtn) {
    comparisonPlayPauseBtn.addEventListener('click', () => {
      const tool = comparisonToolsManager.getCurrentTool();
      if (!tool) return;

      const isAnimating = tool.animating || tool.animatingPoint !== null;

      if (!isAnimating) {
        comparisonToolsManager.executeToolMethod('replayLatest');
        const icon = comparisonPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
        const comparisonPrevBtn = document.getElementById('comparisonPrevBtn');
        const comparisonNextBtn = document.getElementById('comparisonNextBtn');
        if (comparisonPrevBtn) comparisonPrevBtn.style.display = 'none';
        if (comparisonNextBtn) comparisonNextBtn.style.display = 'none';
      } else {
        const newPausedState = !tool.paused;
        comparisonToolsManager.executeToolMethod('setPaused', newPausedState);
        const icon = comparisonPlayPauseBtn.querySelector('i');
        if (icon) icon.className = newPausedState ? 'fas fa-play' : 'fas fa-pause';
        const comparisonPrevBtn = document.getElementById('comparisonPrevBtn');
        const comparisonNextBtn = document.getElementById('comparisonNextBtn');
        if (comparisonPrevBtn) comparisonPrevBtn.style.display = newPausedState ? 'flex' : 'none';
        if (comparisonNextBtn) comparisonNextBtn.style.display = newPausedState ? 'flex' : 'none';
      }
    });
  }

  if (comparisonReplayBtn) {
    comparisonReplayBtn.addEventListener('click', () => {
      comparisonToolsManager.executeToolMethod('replayLatest');
      if (comparisonPlayPauseBtn) {
        comparisonPlayPauseBtn.style.display = 'flex';
        const icon = comparisonPlayPauseBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
      }
      if (comparisonReplayBtn) comparisonReplayBtn.style.display = 'none';
    });
  }

  // Speed control for comparison visualization
  const comparisonSpeedSelect = document.getElementById('comparisonSpeedSelect');
  if (comparisonSpeedSelect) {
    comparisonSpeedSelect.addEventListener('change', (e) => {
      const speed = parseFloat(e.target.value);
      const tool = comparisonToolsManager.getCurrentTool();
      if (tool && tool.setAnimationSpeed) {
        tool.setAnimationSpeed(speed);
      }
    });
  }

  // Navigation buttons for comparison visualization
  const comparisonPrevBtn = document.getElementById('comparisonPrevBtn');
  const comparisonNextBtn = document.getElementById('comparisonNextBtn');

  if (comparisonPrevBtn) {
    comparisonPrevBtn.addEventListener('click', () => {
      comparisonToolsManager.executeToolMethod('moveLatestObject', 'left');
    });
  }

  if (comparisonNextBtn) {
    comparisonNextBtn.addEventListener('click', () => {
      comparisonToolsManager.executeToolMethod('moveLatestObject', 'right');
    });
  }
  } // End of comparison visualization

  // ============================================
  // Chat System Integration
  // ============================================

  // Initialize separate tools manager for chat visualization
  const chatVizContainer = document.getElementById('chatVisualization');
  if (!chatVizContainer) {
    console.error('Chat viz container not found');
  } else {

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

  // Switch to 2dgraph tool (default for this tutorial)
  chatToolsManager.switchTool('2dgraph');
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
      tutorialContext: 'coordinate-points'
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

  } // End of chat visualization
}

// ===================================
// Live Values Display Helper Functions
// ===================================

// For Point Visualization
window.updateLiveValuesPoint = (x, y, vx, vy) => {
  const liveX = document.getElementById('pointLiveX');
  const liveY = document.getElementById('pointLiveY');
  const liveV = document.getElementById('pointLiveV');
  const liveVelocity = document.getElementById('pointLiveVelocity');

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

window.showLiveValuesPoint = () => {
  const liveValues = document.getElementById('pointLiveValues');
  if (liveValues) {
    liveValues.style.display = 'flex';
  }
};

window.hideLiveValuesPoint = () => {
  const liveValues = document.getElementById('pointLiveValues');
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
  window.updateLiveValuesPoint(x, y, vx, vy);
  window.updateLiveValuesExample1(x, y, vx, vy);
  window.updateLiveValuesChat(x, y, vx, vy);
};

window.showLiveValues = () => {
  window.showLiveValuesPoint();
  window.showLiveValuesExample1();
  window.showLiveValuesChat();
};

window.hideLiveValues = () => {
  window.hideLiveValuesPoint();
  window.hideLiveValuesExample1();
  window.hideLiveValuesChat();
};

// Global helper functions that tools can call
window.showControls = () => {
  // Point visualization controls
  const pointControls = document.getElementById('pointSpeedNavControls');
  const pointPlayPause = document.getElementById('pointPlayPauseBtn');
  const pointReplay = document.getElementById('pointReplayBtn');

  if (pointControls) pointControls.style.display = 'flex';
  if (pointPlayPause) pointPlayPause.style.display = 'flex';
  if (pointReplay) pointReplay.style.display = 'none';

  // Example1 visualization controls
  const example1Controls = document.getElementById('example1AnimationControls');
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
  const pointPrevBtn = document.getElementById('pointPrevBtn');
  const pointNextBtn = document.getElementById('pointNextBtn');
  const example1PrevBtn = document.getElementById('example1PrevBtn');
  const example1NextBtn = document.getElementById('example1NextBtn');
  const chatPrevBtn = document.getElementById('chatPrevBtn');
  const chatNextBtn = document.getElementById('chatNextBtn');

  if (pointPrevBtn) pointPrevBtn.style.display = 'none';
  if (pointNextBtn) pointNextBtn.style.display = 'none';
  if (example1PrevBtn) example1PrevBtn.style.display = 'none';
  if (example1NextBtn) example1NextBtn.style.display = 'none';
  if (chatPrevBtn) chatPrevBtn.style.display = 'none';
  if (chatNextBtn) chatNextBtn.style.display = 'none';
};

window.showFinishedControls = () => {
  // Point visualization controls
  const pointControls = document.getElementById('pointSpeedNavControls');
  const pointPlayPause = document.getElementById('pointPlayPauseBtn');
  const pointReplay = document.getElementById('pointReplayBtn');

  if (pointControls) pointControls.style.display = 'flex';
  if (pointPlayPause) pointPlayPause.style.display = 'none';
  if (pointReplay) pointReplay.style.display = 'flex';

  // Example1 visualization controls
  const example1Controls = document.getElementById('example1AnimationControls');
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
  const pointPrevBtn = document.getElementById('pointPrevBtn');
  const pointNextBtn = document.getElementById('pointNextBtn');
  const example1PrevBtn = document.getElementById('example1PrevBtn');
  const example1NextBtn = document.getElementById('example1NextBtn');
  const chatPrevBtn = document.getElementById('chatPrevBtn');
  const chatNextBtn = document.getElementById('chatNextBtn');

  if (pointPrevBtn) pointPrevBtn.style.display = 'flex';
  if (pointNextBtn) pointNextBtn.style.display = 'flex';
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
