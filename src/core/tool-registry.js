/**
 * Tool Registry for Chat Integration
 * Registers tools and makes them available to the AI chat system
 */

class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.toolsManager = null;
  }

  /**
   * Set the tools manager instance
   * @param {ToolsManager} manager
   */
  setToolsManager(manager) {
    this.toolsManager = manager;
  }

  /**
   * Register a tool for use with chat
   * @param {Object} toolDef - Tool definition
   */
  registerTool(toolDef) {
    const {
      id,
      name,
      description,
      category,
      parameters,
      examples,
      handler
    } = toolDef;

    this.tools.set(id, {
      id,
      name,
      description,
      category,
      parameters: parameters || [],
      examples: examples || [],
      handler
    });

    console.log(`Tool registered: ${id}`);
  }

  /**
   * Get tool definition by ID
   * @param {string} toolId
   */
  getTool(toolId) {
    return this.tools.get(toolId);
  }

  /**
   * Get all registered tools
   */
  getAllTools() {
    return Array.from(this.tools.values());
  }

  /**
   * Execute a tool
   * @param {string} toolId
   * @param {Object} parameters
   */
  async executeTool(toolId, parameters) {
    const tool = this.getTool(toolId);

    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    if (tool.handler) {
      return await tool.handler(parameters, this.toolsManager);
    }

    throw new Error(`Tool ${toolId} has no handler`);
  }

  /**
   * Generate system prompt text for AI
   */
  generatePromptText() {
    const tools = this.getAllTools();

    let prompt = `You are a physics tutor with access to interactive visualization tools. You can explain concepts and create visualizations.

# Available Visualization Tools

`;

    tools.forEach(tool => {
      prompt += `## ${tool.name} (${tool.id})
${tool.description}
**Category:** ${tool.category}

**Parameters:**
`;

      tool.parameters.forEach(param => {
        const required = param.required ? ' (required)' : ' (optional)';
        const defaultVal = param.default !== undefined ? `, default: ${param.default}` : '';
        const unit = param.unit ? ` [${param.unit}]` : '';
        prompt += `- ${param.name} (${param.type}${required}${defaultVal})${unit}: ${param.description}\n`;
      });

      prompt += `\n**Example queries:**\n`;
      tool.examples.forEach(ex => {
        prompt += `- "${ex}"\n`;
      });

      prompt += `\n`;
    });

    prompt += `

# How to Create Visualizations

When the user requests a visualization, include a JSON code block with this format:

\`\`\`json
{
  "action": "visualize",
  "tool": "tool_id",
  "parameters": {
    "param1": value1,
    "param2": value2
  }
}
\`\`\`

You can include both explanatory text AND visualization commands in your response.

# Guidelines

1. Explain physics concepts clearly and accurately
2. Use visualizations to support your explanations
3. Break down complex problems into steps
4. Encourage exploration and experimentation
5. Be friendly and encouraging
`;

    return prompt;
  }

  /**
   * Generate tool schema (JSON format for programmatic access)
   */
  generateToolSchema() {
    return this.getAllTools().map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      parameters: tool.parameters,
      examples: tool.examples
    }));
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();
