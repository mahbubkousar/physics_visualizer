/**
 * Message Parser
 *
 * Extracts visualization commands from AI responses
 */

import { formatSafeText } from './safe-html.js';

/**
 * Parse AI response to extract text and visualization commands
 * @param {string} response - The AI response text
 * @returns {Object} Parsed message with text and commands
 */
export function parseAIResponse(response) {
  const result = {
    text: response,
    commands: []
  };

  // Extract JSON code blocks
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
  let match;

  while ((match = jsonBlockRegex.exec(response)) !== null) {
    try {
      const jsonContent = match[1].trim();
      const command = JSON.parse(jsonContent);

      // Validate command structure
      if (command.action === 'visualize' && command.tool && command.parameters) {
        result.commands.push(command);

        // Remove the JSON block from the text
        result.text = result.text.replace(match[0], '').trim();
      }
    } catch (error) {
      console.warn('Failed to parse JSON block:', error);
    }
  }

  // Clean up multiple consecutive newlines
  result.text = result.text.replace(/\n{3,}/g, '\n\n');

  return result;
}

/**
 * Format text for display (markdown-like formatting)
 * @param {string} text - Raw text
 * @returns {string} HTML formatted text
 */
export function formatTextForDisplay(text) {
  return formatSafeText(text);
}

/**
 * Validate tool parameters
 * @param {Object} command - The visualization command
 * @param {Object} toolDefinition - Tool definition from registry
 * @returns {Object} Validation result
 */
export function validateCommand(command, toolDefinition) {
  const errors = [];

  if (!toolDefinition) {
    return {
      valid: false,
      errors: [`Tool '${command.tool}' not found`]
    };
  }

  // Check required parameters
  for (const param of toolDefinition.parameters) {
    if (param.required && !(param.name in command.parameters)) {
      errors.push(`Missing required parameter: ${param.name}`);
    }
  }

  // Type checking
  for (const [key, value] of Object.entries(command.parameters)) {
    const paramDef = toolDefinition.parameters.find(p => p.name === key);

    if (!paramDef) {
      errors.push(`Unknown parameter: ${key}`);
      continue;
    }

    // Basic type validation
    if (paramDef.type === 'number' && typeof value !== 'number') {
      errors.push(`Parameter '${key}' must be a number`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
