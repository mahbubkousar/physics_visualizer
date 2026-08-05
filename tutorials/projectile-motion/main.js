import { ToolsManager } from '../../src/core/tools-manager.js';
import { Projectile } from '../../src/tools/projectile.js';
import { Graph2D } from '../../src/tools/2dgraph.js';
import { ChatController } from '../../src/core/chat-controller.js';
import { initializeToolDefinitions } from '../../src/core/tool-definitions.js';

const vizContainer = document.getElementById('visualization');
const toolsManager = new ToolsManager(vizContainer);

toolsManager.registerTool('projectile', Projectile, {
  config: {
    enableZoom: false,
    enableRotate: false,
    enablePan: false,
  }
});

toolsManager.registerTool('2dgraph', Graph2D, {
  config: {
    enableZoom: false,
    enableRotate: false,
    enablePan: false,
  }
});

toolsManager.switchTool('projectile');
toolsManager.startAnimation();

window.toolsManager = toolsManager;

const v0Input = document.getElementById('v0Input');
const thetaInput = document.getElementById('thetaInput');
const y0Input = document.getElementById('y0Input');
const launchBtn = document.getElementById('launchBtn');
const resetBtn = document.getElementById('resetBtn');

const rangeValue = document.getElementById('rangeValue');
const heightValue = document.getElementById('heightValue');
const timeValue = document.getElementById('timeValue');

function updateCalculatedValues() {
  const v0 = parseFloat(v0Input.value);
  const theta = parseFloat(thetaInput.value) * Math.PI / 180;
  const y0 = parseFloat(y0Input.value);
  const g = 9.8;

  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);

  const discriminant = vy * vy + 2 * g * y0;
  const timeOfFlight = discriminant >= 0 ? (vy + Math.sqrt(discriminant)) / g : 0;

  const range = vx * timeOfFlight;
  const maxHeight = y0 + (vy * vy) / (2 * g);

  rangeValue.textContent = `${range.toFixed(2)} m`;
  heightValue.textContent = `${maxHeight.toFixed(2)} m`;
  timeValue.textContent = `${timeOfFlight.toFixed(2)} s`;
}

// Launch button handler
launchBtn.addEventListener('click', () => {
  const v0 = parseFloat(v0Input.value);
  const theta = parseFloat(thetaInput.value);
  const y0 = parseFloat(y0Input.value);

  updateCalculatedValues();

  // Random color for each launch
  const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Launch projectile
  toolsManager.executeToolMethod('launch', v0, theta, 0, y0, color);

  // Show animation controls with only play/pause (hide replay during animation)
  document.getElementById('animationControls').style.display = 'flex';
  const playPauseBtn = document.getElementById('playPauseBtn');
  const replayBtn = document.getElementById('replayBtn');
  if (playPauseBtn) playPauseBtn.style.display = 'flex';
  if (replayBtn) replayBtn.style.display = 'none';
});

// Reset button handler
resetBtn.addEventListener('click', () => {
  toolsManager.resetCurrentTool();
  rangeValue.textContent = '--';
  heightValue.textContent = '--';
  timeValue.textContent = '--';

  // Hide animation controls and live values
  document.getElementById('animationControls').style.display = 'none';
  window.hideLiveValuesManual();
});

// Update calculations when inputs change
[v0Input, thetaInput, y0Input].forEach(input => {
  input.addEventListener('input', updateCalculatedValues);
});

// Initial calculation
updateCalculatedValues();

// Animation control handlers for manual visualization
const playPauseBtn = document.getElementById('playPauseBtn');
const replayBtnMain = document.getElementById('replayBtn');

if (playPauseBtn) {
  playPauseBtn.addEventListener('click', () => {
    const tool = toolsManager.getCurrentTool();
    if (!tool) return;

    // Check if there's an active animation
    const isAnimating = tool.animating || tool.animatingPoint !== null;

    if (!isAnimating) {
      // If no animation is running, replay instead
      toolsManager.executeToolMethod('replayLatest');
      const icon = playPauseBtn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-pause';
      }
      // Hide navigation arrows during replay
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    } else {
      // Toggle pause state
      const newPausedState = !tool.paused;
      toolsManager.executeToolMethod('setPaused', newPausedState);

      // Update button icon
      const icon = playPauseBtn.querySelector('i');
      if (icon) {
        icon.className = newPausedState ? 'fas fa-play' : 'fas fa-pause';
      }

      // Show/hide navigation arrows based on pause state
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      if (prevBtn) prevBtn.style.display = newPausedState ? 'flex' : 'none';
      if (nextBtn) nextBtn.style.display = newPausedState ? 'flex' : 'none';
    }
  });
}

if (replayBtnMain) {
  replayBtnMain.addEventListener('click', () => {
    // Execute replay
    toolsManager.executeToolMethod('replayLatest');

    // Show play/pause, hide replay (animation is now running)
    if (playPauseBtn) {
      playPauseBtn.style.display = 'flex';
      const icon = playPauseBtn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-pause';
      }
    }
    if (replayBtnMain) {
      replayBtnMain.style.display = 'none';
    }
  });
}

// Speed control for manual visualization
const speedSelect = document.getElementById('speedSelect');
if (speedSelect) {
  speedSelect.addEventListener('change', (e) => {
    const speed = parseFloat(e.target.value);
    const tool = toolsManager.getCurrentTool();
    if (tool && tool.setAnimationSpeed) {
      tool.setAnimationSpeed(speed);
    }
  });
}

// Navigation buttons for manual visualization
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    toolsManager.executeToolMethod('moveLatestObject', 'left');
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    toolsManager.executeToolMethod('moveLatestObject', 'right');
  });
}

// ============================================
// Chat System Integration
// ============================================

// Initialize separate tools manager for chat visualization
const chatVizContainer = document.getElementById('chatVisualization');
const chatToolsManager = new ToolsManager(chatVizContainer);

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

// Animation control handlers for chat visualization
const chatPlayPauseBtn = document.getElementById('chatPlayPauseBtn');
const chatReplayBtnChat = document.getElementById('chatReplayBtn');

if (chatPlayPauseBtn) {
  chatPlayPauseBtn.addEventListener('click', () => {
    const tool = chatToolsManager.getCurrentTool();
    if (!tool) return;

    // Check if there's an active animation
    const isAnimating = tool.animating || tool.animatingPoint !== null;

    if (!isAnimating) {
      // If no animation is running, replay instead
      chatToolsManager.executeToolMethod('replayLatest');
      const icon = chatPlayPauseBtn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-pause';
      }
      // Hide navigation arrows during replay
      const chatPrevBtn = document.getElementById('chatPrevBtn');
      const chatNextBtn = document.getElementById('chatNextBtn');
      if (chatPrevBtn) chatPrevBtn.style.display = 'none';
      if (chatNextBtn) chatNextBtn.style.display = 'none';
    } else {
      // Toggle pause state
      const newPausedState = !tool.paused;
      chatToolsManager.executeToolMethod('setPaused', newPausedState);

      // Update button icon
      const icon = chatPlayPauseBtn.querySelector('i');
      if (icon) {
        icon.className = newPausedState ? 'fas fa-play' : 'fas fa-pause';
      }

      // Show/hide navigation arrows based on pause state
      const chatPrevBtn = document.getElementById('chatPrevBtn');
      const chatNextBtn = document.getElementById('chatNextBtn');
      if (chatPrevBtn) chatPrevBtn.style.display = newPausedState ? 'flex' : 'none';
      if (chatNextBtn) chatNextBtn.style.display = newPausedState ? 'flex' : 'none';
    }
  });
}

if (chatReplayBtnChat) {
  chatReplayBtnChat.addEventListener('click', () => {
    // Execute replay
    chatToolsManager.executeToolMethod('replayLatest');

    // Show play/pause, hide replay (animation is now running)
    if (chatPlayPauseBtn) {
      chatPlayPauseBtn.style.display = 'flex';
      const icon = chatPlayPauseBtn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-pause';
      }
    }
    if (chatReplayBtnChat) {
      chatReplayBtnChat.style.display = 'none';
    }
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

// Helper functions for chat animation controls
window.showChatAnimationControls = () => {
  const controls = document.getElementById('chatAnimationControls');
  if (controls) {
    controls.style.display = 'flex';
  }
  // Hide placeholder
  const placeholder = document.querySelector('.chat-viz-panel .viz-placeholder');
  if (placeholder) {
    placeholder.style.display = 'none';
  }
  // When animation starts: show play/pause, hide replay
  const chatPlayPauseBtn = document.getElementById('chatPlayPauseBtn');
  const chatReplayBtn = document.getElementById('chatReplayBtn');

  if (chatPlayPauseBtn) {
    chatPlayPauseBtn.style.display = 'flex';
    const icon = chatPlayPauseBtn.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-pause';
    }
  }

  if (chatReplayBtn) {
    chatReplayBtn.style.display = 'none';
  }
};

// ============================================
// Live Values Display Functions
// ============================================

// For Manual Visualization
window.updateLiveValuesManual = (x, y, vx, vy) => {
  const liveX = document.getElementById('liveX');
  const liveY = document.getElementById('liveY');
  const liveV = document.getElementById('liveV');
  const liveVelocity = document.getElementById('liveVelocity');

  if (liveX) liveX.textContent = x.toFixed(2);
  if (liveY) liveY.textContent = y.toFixed(2);

  // Show velocity if provided (for projectile motion)
  if (vx !== undefined && vy !== undefined && liveV && liveVelocity) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    liveV.textContent = speed.toFixed(2);
    liveVelocity.style.display = 'flex';
  } else if (liveVelocity) {
    liveVelocity.style.display = 'none';
  }
};

window.showLiveValuesManual = (showVelocity = false) => {
  const liveValues = document.getElementById('liveValues');
  if (liveValues) {
    liveValues.style.display = 'flex';
  }
};

window.hideLiveValuesManual = () => {
  const liveValues = document.getElementById('liveValues');
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

  // Show velocity if provided (for projectile motion)
  if (vx !== undefined && vy !== undefined && liveV && liveVelocity) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    liveV.textContent = speed.toFixed(2);
    liveVelocity.style.display = 'flex';
  } else if (liveVelocity) {
    liveVelocity.style.display = 'none';
  }
};

window.showLiveValuesChat = (showVelocity = false) => {
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

// Generic functions called by tools (routes to appropriate display)
window.updateLiveValues = (x, y, vx, vy) => {
  // Update both displays - whichever is active will show
  window.updateLiveValuesManual(x, y, vx, vy);
  window.updateLiveValuesChat(x, y, vx, vy);
};

window.showLiveValues = (showVelocity = false) => {
  // Show both displays - CSS will handle which is visible
  window.showLiveValuesManual(showVelocity);
  window.showLiveValuesChat(showVelocity);
};

window.hideLiveValues = () => {
  window.hideLiveValuesManual();
  window.hideLiveValuesChat();
};

// Global helper functions that tools can call
// These work for BOTH manual and chat visualizations
window.showControls = () => {
  window.showChatAnimationControls();

  // Also handle manual visualization controls
  const manualPlayPause = document.getElementById('playPauseBtn');
  const manualReplay = document.getElementById('replayBtn');

  if (manualPlayPause) manualPlayPause.style.display = 'flex';
  if (manualReplay) manualReplay.style.display = 'none';

  // Hide navigation arrows during animation
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const chatPrevBtn = document.getElementById('chatPrevBtn');
  const chatNextBtn = document.getElementById('chatNextBtn');

  if (prevBtn) prevBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';
  if (chatPrevBtn) chatPrevBtn.style.display = 'none';
  if (chatNextBtn) chatNextBtn.style.display = 'none';
};

window.showFinishedControls = () => {
  // Chat controls
  const chatControls = document.getElementById('chatAnimationControls');
  if (chatControls) {
    chatControls.style.display = 'flex';
  }

  const chatPlayPauseBtn = document.getElementById('chatPlayPauseBtn');
  const chatReplayBtn = document.getElementById('chatReplayBtn');

  if (chatPlayPauseBtn) {
    chatPlayPauseBtn.style.display = 'none';
  }

  if (chatReplayBtn) {
    chatReplayBtn.style.display = 'flex';
  }

  // Manual controls
  const manualPlayPause = document.getElementById('playPauseBtn');
  const manualReplay = document.getElementById('replayBtn');

  if (manualPlayPause) manualPlayPause.style.display = 'none';
  if (manualReplay) manualReplay.style.display = 'flex';

  // Show navigation arrows when animation is finished
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const chatPrevBtn = document.getElementById('chatPrevBtn');
  const chatNextBtn = document.getElementById('chatNextBtn');

  if (prevBtn) prevBtn.style.display = 'flex';
  if (nextBtn) nextBtn.style.display = 'flex';
  if (chatPrevBtn) chatPrevBtn.style.display = 'flex';
  if (chatNextBtn) chatNextBtn.style.display = 'flex';
};

// Function to hide duplicate zero labels
function hideXAxisZeroLabels() {
  // Wait for MathBox to render
  setTimeout(() => {
    // Find all canvases
    const containers = [
      document.getElementById('visualization'),
      document.getElementById('chatVisualization')
    ];

    containers.forEach(container => {
      if (!container) return;

      // MathBox renders to canvas, but may also use DOM elements for labels
      // Try to find and hide zero labels on X-axis
      const labels = container.querySelectorAll('[class*="label"]');
      labels.forEach(label => {
        const text = label.textContent || label.innerText;
        if (text && text.trim() === '0' || text.trim() === '0.0') {
          // Check position to determine if it's on X-axis (below origin)
          const rect = label.getBoundingClientRect();
          const parentRect = container.getBoundingClientRect();
          const relativeY = rect.top - parentRect.top;
          const containerHeight = parentRect.height;

          // If label is in bottom half and near horizontal center, it's likely X-axis zero
          if (relativeY > containerHeight * 0.4) {
            label.style.opacity = '0';
          }
        }
      });
    });
  }, 500);
}

// Call after page loads
window.addEventListener('load', hideXAxisZeroLabels);

// Also call when visualization updates
const originalLaunch = toolsManager.executeToolMethod;
toolsManager.executeToolMethod = function(...args) {
  const result = originalLaunch.apply(this, args);
  hideXAxisZeroLabels();
  return result;
};

console.log('Projectile Motion Tutorial loaded!');
