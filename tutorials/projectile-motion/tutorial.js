// ===================================
// Imports
// ===================================

import { ToolsManager } from '../../src/core/tools-manager.js';
import { Projectile } from '../../src/tools/projectile.js';
import { Graph2D } from '../../src/tools/2dgraph.js';
import { ChatController } from '../../src/core/chat-controller.js';
import { initializeToolDefinitions } from '../../src/core/tool-definitions.js';
import { config } from '../../config.js';

// ===================================
// Progress & Score Tracking System
// ===================================

let currentScore = 0;
let maxScore = 100;
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

// Make functions available globally for inline onclick handlers
window.toggleTOC = toggleTOC;
window.scrollToSection = scrollToSection;

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

window.scrollToChat = scrollToChat;

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

window.checkQuizQuestion1 = checkQuizQuestion1;

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

window.checkQuizQuestion2 = checkQuizQuestion2;

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

window.checkQuizQuestion3 = checkQuizQuestion3;

// ===================================
// Descriptive Question Evaluation (Mock AI)
// ===================================

// Note: In a real implementation, this would call your backend API with Gemini
// For now, we'll provide intelligent mock responses based on keyword detection

function evaluateDescriptiveQuestion1() {
  const textarea = document.getElementById('desc-q1');
  const feedback = document.getElementById('desc-q1-feedback');
  const scoreEl = document.getElementById('desc-q1-score');
  const feedbackText = document.getElementById('desc-q1-feedback-text');
  const answer = textarea.value.trim().toLowerCase();

  if (!answer) {
    alert('Please provide an answer');
    return;
  }

  // Intelligent keyword-based evaluation
  let score = 0;
  let feedbackParts = [];

  // Check for key concepts
  const hasSameRange = answer.includes('same') && (answer.includes('range') || answer.includes('distance'));
  const hasComplementary = answer.includes('complement') || answer.includes('90') || answer.includes('20 + 70');
  const hasSinFormula = answer.includes('sin') && answer.includes('2');
  const mentionsComponents = answer.includes('horizontal') && answer.includes('vertical');

  if (hasSameRange) {
    score += 3;
    feedbackParts.push('✓ You correctly identified that they have the same range.');
  } else {
    feedbackParts.push('✗ The key insight is that both projectiles actually have the SAME range.');
  }

  if (hasComplementary) {
    score += 4;
    feedbackParts.push('✓ Excellent! You recognized that 20° and 70° are complementary angles (they add up to 90°).');
  } else {
    feedbackParts.push('Consider the relationship between 20° and 70° - they add up to 90°.');
  }

  if (hasSinFormula) {
    score += 2;
    feedbackParts.push('✓ Great use of the formula involving sin(2θ)!');
  }

  if (mentionsComponents) {
    score += 1;
    feedbackParts.push('✓ Good analysis of velocity components.');
  }

  // Ensure minimum score
  score = Math.max(score, 3);

  // Display feedback
  scoreEl.textContent = `Score: ${score}/10`;
  feedbackText.textContent = feedbackParts.join(' ');
  feedback.classList.add('visible');

  // Update total score
  updateScore(score);
}

window.evaluateDescriptiveQuestion1 = evaluateDescriptiveQuestion1;

function evaluateDescriptiveQuestion2() {
  const textarea = document.getElementById('desc-q2');
  const feedback = document.getElementById('desc-q2-feedback');
  const scoreEl = document.getElementById('desc-q2-score');
  const feedbackText = document.getElementById('desc-q2-feedback-text');
  const answer = textarea.value.trim().toLowerCase();

  if (!answer) {
    alert('Please provide an answer');
    return;
  }

  // Intelligent keyword-based evaluation
  let score = 0;
  let feedbackParts = [];

  // Check for key concepts
  const saysSimultaneous = answer.includes('same time') || answer.includes('simultaneous') || answer.includes('together');
  const mentionsVertical = answer.includes('vertical') && !answer.includes('horizontal');
  const explainsIndependence = answer.includes('independent') || (answer.includes('horizontal') && answer.includes('vertical'));
  const correctConclusion = answer.includes('same') && (answer.includes('time') || answer.includes('ground'));

  if (correctConclusion) {
    score += 4;
    feedbackParts.push('✓ Correct conclusion - both balls hit the ground at the same time!');
  } else {
    feedbackParts.push('✗ The correct answer is that both balls hit the ground at the SAME time.');
  }

  if (explainsIndependence) {
    score += 3;
    feedbackParts.push('✓ Excellent! You understand that horizontal and vertical motions are independent.');
  } else {
    feedbackParts.push('Key concept: horizontal and vertical motions are independent of each other.');
  }

  if (mentionsVertical) {
    score += 2;
    feedbackParts.push('✓ Good focus on vertical motion, which is what determines when they hit the ground.');
  }

  if (answer.includes('gravity')) {
    score += 1;
    feedbackParts.push('✓ Correctly mentioned gravity\'s role.');
  }

  // Ensure minimum score
  score = Math.max(score, 2);

  // Display feedback
  scoreEl.textContent = `Score: ${score}/10`;
  feedbackText.textContent = feedbackParts.join(' ');
  feedback.classList.add('visible');

  // Update total score
  updateScore(score);
}

window.evaluateDescriptiveQuestion2 = evaluateDescriptiveQuestion2;

// ===================================
// Visualization Functionality
// ===================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeVisualizations);
} else {
  initializeVisualizations();
}

function initializeVisualizations() {
  console.log('Initializing visualizations...');

  // Initialize Static Visualization
  const staticVizContainer = document.getElementById('staticViz');
  if (!staticVizContainer) {
    console.error('Static viz container not found');
    return;
  }

  console.log('Static viz container found:', staticVizContainer);

  let staticToolsManager;

  try {
    staticToolsManager = new ToolsManager(staticVizContainer);
    console.log('ToolsManager created');

    staticToolsManager.registerTool('projectile', Projectile, {
      config: {
        enableZoom: false,
        enableRotate: false,
        enablePan: false,
      }
    });
    console.log('Projectile tool registered');

    staticToolsManager.switchTool('projectile');
    console.log('Switched to projectile tool');

    // Set renderer size to match container
    const staticWidth = staticVizContainer.clientWidth;
    const staticHeight = staticVizContainer.clientHeight;
    console.log('Container dimensions:', staticWidth, 'x', staticHeight);

    staticToolsManager.three.renderer.setSize(staticWidth, staticHeight);
    staticToolsManager.three.camera.aspect = staticWidth / staticHeight;
    staticToolsManager.three.camera.updateProjectionMatrix();

    staticToolsManager.startAnimation();
    console.log('Animation started');

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
    console.log('Run button clicked');
    console.log('staticToolsManager:', staticToolsManager);

    const v0 = parseFloat(document.getElementById('static-v0').value);
    const theta = parseFloat(document.getElementById('static-angle').value);
    const y0 = parseFloat(document.getElementById('static-y0').value);

    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
    const color = colors[Math.floor(Math.random() * colors.length)];

    console.log('Launching projectile:', { v0, theta, y0, color });

    try {
      staticToolsManager.executeToolMethod('launch', v0, theta, 0, y0, color);
      console.log('Launch executed successfully');
      console.log('Canvas in container:', staticVizContainer.querySelector('canvas'));
    } catch (error) {
      console.error('Error launching projectile:', error);
    }
  });

  document.getElementById('btnResetStatic')?.addEventListener('click', () => {
    staticToolsManager.resetCurrentTool();
    document.getElementById('static-v0').value = 20;
    document.getElementById('static-angle').value = 45;
    document.getElementById('static-y0').value = 0;
  });

  // Initialize Example 1 Visualization
  const example1VizContainer = document.getElementById('example1Viz');
  if (!example1VizContainer) {
    console.error('Example1 viz container not found');
    return;
  }

  const example1ToolsManager = new ToolsManager(example1VizContainer);

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

    console.log('Launching example cannonball');
    // Parameters from example: v0=100 m/s, angle=30°, y0=0
    example1ToolsManager.executeToolMethod('launch', 100, 30, 0, 0, color);
  });

  document.getElementById('btnResetExample1')?.addEventListener('click', () => {
    example1ToolsManager.resetCurrentTool();
  });

  // Initialize Chat Visualization
  const chatVizContainer = document.getElementById('chatVisualization');
  if (!chatVizContainer) {
    console.error('Chat viz container not found');
    return;
  }

  console.log('Chat viz container found:', chatVizContainer);

  const chatToolsManager = new ToolsManager(chatVizContainer);
  console.log('Chat ToolsManager created');

  // Register tools for chat
  chatToolsManager.registerTool('projectile', Projectile, {
    config: {
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
    }
  });
  console.log('Chat projectile tool registered');

  chatToolsManager.registerTool('2dgraph', Graph2D, {
    config: {
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
    }
  });

  // Initialize tool definitions for chat
  initializeToolDefinitions(chatToolsManager);

  // Switch to projectile tool
  chatToolsManager.switchTool('projectile');
  console.log('Chat switched to projectile tool');

  // Set renderer size to match container
  const chatWidth = chatVizContainer.clientWidth;
  const chatHeight = chatVizContainer.clientHeight;
  console.log('Chat container dimensions:', chatWidth, 'x', chatHeight);

  chatToolsManager.three.renderer.setSize(chatWidth, chatHeight);
  chatToolsManager.three.camera.aspect = chatWidth / chatHeight;
  chatToolsManager.three.camera.updateProjectionMatrix();

  chatToolsManager.startAnimation();
  console.log('Chat animation started');
  console.log('Chat canvas:', chatVizContainer.querySelector('canvas'));

  // Hide placeholder initially when visualization initializes
  const chatPlaceholder = document.querySelector('.chat-viz-placeholder');
  if (chatPlaceholder) {
    chatPlaceholder.style.display = 'none';
  }

  window.chatToolsManager = chatToolsManager;

  // Initialize Chat Controller if API key is available
  const GEMINI_API_KEY = config.GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY');

  if (GEMINI_API_KEY && GEMINI_API_KEY.trim()) {
    try {
      const chatController = new ChatController(GEMINI_API_KEY, {
        toolsManager: chatToolsManager,
        tutorialContext: 'projectile-motion'
      });

      window.chatController = chatController;
      console.log('Chat system initialized');
    } catch (error) {
      console.error('Failed to initialize chat:', error);

      const chatMessages = document.getElementById('chatMessages');
      if (chatMessages) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chat-message assistant';
        errorMsg.style.color = '#991b1b';
        errorMsg.textContent = `Failed to initialize chat: ${error.message}`;
        chatMessages.appendChild(errorMsg);
      }
    }
  } else {
    console.warn('No API key provided. Using mock responses.');
  }

  // Chat input handlers
  document.getElementById('sendBtn')?.addEventListener('click', () => {
    sendChatMessage(chatToolsManager);
  });

  document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage(chatToolsManager);
    }
  });
}

function sendChatMessage(chatToolsManager) {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessageToChat(message, 'user');

  // Clear input
  input.value = '';

  // If ChatController is available, use it
  if (window.chatController) {
    window.chatController.sendMessage(message);
  } else {
    // Otherwise use mock AI response
    setTimeout(() => {
      processAIResponse(message, chatToolsManager);
    }, 1000);
  }
}

function addMessageToChat(message, sender) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');

  messageDiv.className = 'chat-message ' + sender;
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processAIResponse(userMessage, chatToolsManager) {
  const msg = userMessage.toLowerCase();

  // Simple pattern matching for demo
  if (msg.includes('show') || msg.includes('visualize') || msg.includes('simulate') || msg.includes('launch')) {
    // Try to parse parameters from the message
    const velocityMatch = msg.match(/(\d+)\s*(m\/s|ms|meters)/);
    const angleMatch = msg.match(/(\d+)\s*(degree|deg|°)/);
    const heightMatch = msg.match(/height.*?(\d+)/);

    const v0 = velocityMatch ? parseFloat(velocityMatch[1]) : 25;
    const theta = angleMatch ? parseFloat(angleMatch[1]) : 45;
    const y0 = heightMatch ? parseFloat(heightMatch[1]) : 0;

    addMessageToChat(`Sure! I'll show you a projectile with initial velocity ${v0} m/s at ${theta}° angle from height ${y0} m.`, 'assistant');

    // Hide placeholder and launch visualization
    const placeholder = document.querySelector('.chat-viz-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }

    // Random color
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
    const color = colors[Math.floor(Math.random() * colors.length)];

    setTimeout(() => {
      chatToolsManager.executeToolMethod('launch', v0, theta, 0, y0, color);
    }, 500);

  } else if (msg.includes('what') || msg.includes('explain') || msg.includes('why')) {
    addMessageToChat('That\'s a great question! In projectile motion, the key is understanding that horizontal and vertical motions are independent. What specific aspect would you like me to explain more?', 'assistant');
  } else if (msg.includes('help')) {
    addMessageToChat('I can help you with:\n• Explaining projectile motion concepts\n• Creating custom visualizations\n• Solving example problems\n\nJust ask me anything! Try: "show a projectile at 30 m/s at 60 degrees"', 'assistant');
  } else {
    addMessageToChat('I can help you understand projectile motion! Try asking me to "show a projectile at 30 m/s at 60 degrees" or ask "what is the maximum height?"', 'assistant');
  }
}

// ===================================
// Initialize
// ===================================

console.log('Tutorial functionality loaded');
console.log('Progress tracking: Active');
console.log('Score tracking: Active');
console.log('Sections:', totalSections);

// Close TOC when clicking outside
document.addEventListener('click', (e) => {
  const tocPanel = document.getElementById('tocPanel');
  const tocBtn = document.getElementById('btnTOC');

  if (tocPanel.classList.contains('active') && !tocPanel.contains(e.target) && e.target !== tocBtn) {
    tocPanel.classList.remove('active');
  }
});
