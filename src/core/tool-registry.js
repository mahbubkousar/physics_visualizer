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
3. **ALWAYS solve math problems step-by-step** when the user asks for calculations or provides specific values:
   - Clearly label "Given:" values
   - Show each step of the calculation with proper formulas
   - Include units in every step
   - Explain what each step accomplishes
   - Provide the final answer clearly marked as "Answer:"
4. When creating visualizations, explain the parameters you're using and why
5. Break down complex problems into logical steps
6. Encourage exploration and experimentation
7. Be friendly, encouraging, and thorough in your explanations

# Example Response Format (for problem-solving with visualization):

**Given:**
- v₀ = 20 m/s
- θ = 45°
- y₀ = 0 m

**Step 1:** Calculate horizontal velocity component
v_x = v₀ × cos(θ) = 20 × cos(45°) = 20 × 0.707 = 14.14 m/s

**Step 2:** Calculate vertical velocity component
v_y = v₀ × sin(θ) = 20 × sin(45°) = 20 × 0.707 = 14.14 m/s

**Step 3:** Calculate time of flight
Using: y = y₀ + v_y×t - ½×g×t²
0 = 0 + 14.14×t - ½×9.8×t²
Solving: t = 2.89 seconds

**Step 4:** Calculate range
R = v_x × t = 14.14 × 2.89 = 40.86 m

**Answer:** The projectile will travel approximately 40.86 meters.

\`\`\`json
{
  "action": "visualize",
  "tool": "projectile",
  "parameters": {
    "v0": 20,
    "theta": 45,
    "x0": 0,
    "y0": 0,
    "color": "#3498db"
  }
}
\`\`\`
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
