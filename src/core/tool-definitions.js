/**
 * Tool Definitions
 * Registers all visualization tools with the tool registry
 */

import { toolRegistry } from './tool-registry.js';

/**
 * Initialize and register all tools
 * @param {ToolsManager} toolsManager - The tools manager instance
 */
export function initializeToolDefinitions(toolsManager) {
  // Set the tools manager in the registry
  toolRegistry.setToolsManager(toolsManager);

  // Register 2D Graph Tool
  toolRegistry.registerTool({
    id: 'plot_2d_point',
    name: '2D Point Plotter',
    description: 'Plots points on a 2D Cartesian coordinate system with animated path visualization',
    category: 'coordinate_geometry',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'X coordinate of the point',
        required: true
      },
      {
        name: 'y',
        type: 'number',
        description: 'Y coordinate of the point',
        required: true
      },
      {
        name: 'color',
        type: 'number',
        description: 'Color of the point in hexadecimal format (e.g., 0x3498db for blue)',
        required: false,
        default: 0x3498db
      }
    ],
    examples: [
      'Plot the point (5, 3)',
      'Show me the point (-2, 4) on a graph',
      'Add a point at coordinates (0, 0)',
      'Plot several points: (2,3), (-1,4), (5,-2)'
    ],
    handler: async (params, toolsManager) => {
      const { x, y, color = 0x3498db } = params;

      // Ensure we're using the 2D graph tool
      if (toolsManager.getCurrentToolName() !== '2dgraph') {
        toolsManager.switchTool('2dgraph');
      }

      // Add the point
      toolsManager.executeToolMethod('addPoint', x, y, color);

      // Show animation controls if available
      if (typeof window.showChatAnimationControls === 'function') {
        window.showChatAnimationControls();
      }

      return {
        success: true,
        message: `Point plotted at (${x}, ${y})`
      };
    }
  });

  // Register Projectile Motion Tool
  toolRegistry.registerTool({
    id: 'projectile_motion',
    name: 'Projectile Motion',
    description: 'Simulates projectile motion with given initial velocity and launch angle',
    category: 'kinematics',
    parameters: [
      {
        name: 'v0',
        type: 'number',
        description: 'Initial velocity',
        required: true,
        unit: 'm/s'
      },
      {
        name: 'theta',
        type: 'number',
        description: 'Launch angle',
        required: true,
        unit: 'degrees'
      },
      {
        name: 'x0',
        type: 'number',
        description: 'Initial horizontal position',
        required: false,
        default: 0,
        unit: 'm'
      },
      {
        name: 'y0',
        type: 'number',
        description: 'Initial vertical position (height)',
        required: false,
        default: 0,
        unit: 'm'
      },
      {
        name: 'g',
        type: 'number',
        description: 'Gravitational acceleration',
        required: false,
        default: 9.8,
        unit: 'm/s²'
      },
      {
        name: 'color',
        type: 'number',
        description: 'Color of the trajectory in hexadecimal format',
        required: false,
        default: 0xe74c3c
      }
    ],
    examples: [
      'Launch a projectile at 20 m/s at 45 degrees',
      'Show projectile motion with initial velocity 30 m/s and angle 60 degrees',
      'Simulate a ball thrown at 15 m/s at 30 degrees from a height of 2 meters',
      'What happens if I throw something at 25 m/s at 45 degrees?'
    ],
    handler: async (params, toolsManager) => {
      const {
        v0,
        theta,
        x0 = 0,
        y0 = 0,
        color = 0xe74c3c
      } = params;

      // Ensure we're using the projectile tool
      if (toolsManager.getCurrentToolName() !== 'projectile') {
        toolsManager.switchTool('projectile');
      }

      // Launch the projectile
      toolsManager.executeToolMethod('launch', v0, theta, x0, y0, color);

      // Show animation controls if available
      if (typeof window.showChatAnimationControls === 'function') {
        window.showChatAnimationControls();
      }

      return {
        success: true,
        message: `Projectile launched with v₀=${v0} m/s at θ=${theta}°`
      };
    }
  });

  console.log('Tool definitions initialized');
  console.log('Registered tools:', toolRegistry.getAllTools().map(t => t.id));
}
