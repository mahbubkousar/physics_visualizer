/**
 * Chat Controller
 *
 * Manages chat interface and coordinates between UI, API, and visualization tools
 */

import { GeminiChat } from './gemini-api.js';
import { parseAIResponse, formatTextForDisplay, validateCommand } from './message-parser.js';
import { toolRegistry } from './tool-registry.js';

export class ChatController {
  constructor(apiKey, options = {}) {
    console.log('ChatController: Initializing...');

    // Support custom element IDs for flexible integration
    const {
      toolsManager = null,
      tutorialContext = null,
      chatContainerId = 'chat-container',
      inputFieldId = 'chat-input',
      sendButtonId = 'send-btn'
    } = options;

    this.toolsManager = toolsManager;
    this.tutorialContext = tutorialContext;

    this.chatContainer = document.getElementById(chatContainerId) || document.getElementById('chatMessages');
    this.inputField = document.getElementById(inputFieldId) || document.getElementById('chatInput');
    this.sendButton = document.getElementById(sendButtonId) || document.getElementById('sendBtn');
    this.typingIndicator = document.querySelector('.typing-indicator') || document.getElementById('typingIndicator');

    if (!this.chatContainer || !this.inputField || !this.sendButton) {
      throw new Error('Chat UI elements not found');
    }

    if (!this.typingIndicator) {
      console.warn('ChatController: Typing indicator not found - will continue without it');
    }

    console.log('ChatController: UI elements found');

    // Set tools manager in registry if provided
    if (this.toolsManager) {
      toolRegistry.setToolsManager(this.toolsManager);
    }

    // Initialize Gemini chat with system prompt from tool registry
    const systemPrompt = toolRegistry.generatePromptText();
    console.log('ChatController: System prompt generated:', systemPrompt.substring(0, 100) + '...');

    this.geminiChat = new GeminiChat(apiKey, systemPrompt);
    console.log('ChatController: Gemini chat initialized');

    // Prevent duplicate requests
    this.isProcessing = false;

    this.setupEventListeners();
    console.log('ChatController: Event listeners setup complete');
  }

  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', () => this.handleSendMessage());

    // Enter key (without shift)
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Auto-resize textarea
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = this.inputField.scrollHeight + 'px';
    });
  }

  async handleSendMessage() {
    const message = this.inputField.value.trim();
    console.log('handleSendMessage: Message:', message);

    if (!message) return;

    // Prevent duplicate requests if already processing
    if (this.isProcessing) {
      console.log('handleSendMessage: Already processing, ignoring duplicate request');
      return;
    }

    this.isProcessing = true;

    // Disable input during processing
    this.setInputEnabled(false);

    // Add user message to chat
    this.addMessage('user', message);

    // Clear input
    this.inputField.value = '';
    this.inputField.style.height = 'auto';

    // Show typing indicator
    this.showTypingIndicator(true);

    try {
      console.log('handleSendMessage: Sending to Gemini...');
      // Get response from Gemini
      const response = await this.geminiChat.sendMessage(message);
      console.log('handleSendMessage: Got response:', response.substring(0, 100) + '...');

      // Parse response for text and visualization commands
      const parsed = parseAIResponse(response);
      console.log('handleSendMessage: Parsed:', parsed);

      // Hide typing indicator
      this.showTypingIndicator(false);

      // Display assistant message
      if (parsed.text) {
        this.addMessage('assistant', parsed.text);
      }

      // Execute visualization commands
      for (const command of parsed.commands) {
        console.log('handleSendMessage: Executing command:', command);
        await this.executeVisualizationCommand(command);
      }

    } catch (error) {
      this.showTypingIndicator(false);
      this.addMessage('system', `Error: ${error.message}`);
      console.error('Chat error:', error);
    } finally {
      this.isProcessing = false;
      this.setInputEnabled(true);
      this.inputField.focus();
    }
  }

  async executeVisualizationCommand(command) {
    try {
      // Get tool definition
      const tool = toolRegistry.getTool(command.tool);

      if (!tool) {
        this.addMessage('system', `Visualization error: Tool '${command.tool}' not found`);
        return;
      }

      // Validate command
      const validation = validateCommand(command, tool);

      if (!validation.valid) {
        this.addMessage('system', `Visualization error: ${validation.errors.join(', ')}`);
        return;
      }

      // Execute the tool through registry (which uses the tools manager)
      const result = await toolRegistry.executeTool(command.tool, command.parameters);

      if (result && result.success) {
        console.log('Visualization created:', result.message || 'Success');
        this.addMessage('system', `✓ Visualization created: ${tool.name}`);
      }

    } catch (error) {
      this.addMessage('system', `Failed to create visualization: ${error.message}`);
      console.error('Visualization error:', error);
    }
  }

  addArtifactCard(artifactId, tool, parameters) {
    const card = document.createElement('div');
    card.className = 'artifact-card active';
    card.dataset.artifactId = artifactId;

    // Determine icon based on tool category
    const iconClass = tool.category === 'coordinate_geometry' ? 'graph' : 'projectile';
    const iconEmoji = tool.category === 'coordinate_geometry' ? '📊' : '🚀';

    const paramStr = Object.entries(parameters)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');

    card.innerHTML = `
      <div class="artifact-icon ${iconClass}">
        ${iconEmoji}
      </div>
      <div class="artifact-info">
        <div class="artifact-title">${tool.name}</div>
        <div class="artifact-params">${paramStr}</div>
      </div>
      <div class="artifact-badge">VIEW</div>
    `;

    // Click handler to switch to this artifact
    card.addEventListener('click', () => {
      this.switchToArtifact(artifactId);
    });

    this.chatContainer.appendChild(card);
    this.scrollToBottom();
  }

  switchToArtifact(artifactId) {
    // Update active state in UI
    document.querySelectorAll('.artifact-card').forEach(card => {
      if (card.dataset.artifactId === artifactId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Switch artifact in the manager
    if (window.artifactManager) {
      window.artifactManager.switchToArtifact(artifactId);
    }
  }

  addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    if (role === 'assistant') {
      messageDiv.innerHTML = formatTextForDisplay(content);
    } else {
      messageDiv.textContent = content;
    }

    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTypingIndicator(show) {
    if (!this.typingIndicator) return;

    if (show) {
      this.typingIndicator.classList.add('active');
      this.scrollToBottom();
    } else {
      this.typingIndicator.classList.remove('active');
    }
  }

  setInputEnabled(enabled) {
    this.inputField.disabled = !enabled;
    this.sendButton.disabled = !enabled;
  }

  scrollToBottom() {
    // Smooth scroll to bottom
    setTimeout(() => {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }, 100);
  }

  clearChat() {
    // Keep only the welcome message
    const welcomeMessage = this.chatContainer.querySelector('.message.system');
    this.chatContainer.innerHTML = '';
    if (welcomeMessage) {
      this.chatContainer.appendChild(welcomeMessage);
    }
    this.geminiChat.clearHistory();
  }
}
