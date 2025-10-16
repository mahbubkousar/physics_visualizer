# Physics Interactive Learning Platform

A modern, scalable physics education platform with interactive visualizations, AI-powered tutoring, and extensible course management.

## Overview

This platform provides an engaging way to learn physics through:
- **Interactive Visualizations**: Real-time, controllable physics simulations
- **AI Tutor Integration**: Gemini-powered chat assistance
- **Tutorial System**: Structured learning paths with theory, examples, and practice
- **Course Management**: Easy-to-navigate homepage with searchable courses
- **Centralized Tools Manager**: Unified configuration system for all visualization tools

## Project Structure

```
visualization/
├── index.html                 # Homepage - Course management interface
├── config.js                  # Configuration (API keys, settings)
├── config.example.js          # Configuration template
│
├── public/                    # Static assets
│   ├── css/
│   │   └── tutorial.css       # Shared tutorial page styles
│   └── images/                # Images and icons
│
├── src/                       # Source code
│   ├── core/                  # Core systems
│   │   ├── tools-manager.js   # Centralized visualization manager
│   │   ├── tool-registry.js   # Tool registration for AI chat
│   │   ├── tool-definitions.js # Tool definitions for chat
│   │   ├── gemini-api.js      # Gemini API wrapper
│   │   ├── chat-controller.js # Chat UI controller
│   │   └── message-parser.js  # AI response parser
│   │
│   ├── tools/                 # Visualization tools
│   │   ├── 2dgraph.js         # 2D graph plotting tool
│   │   ├── projectile.js      # Projectile motion simulator
│   │   └── [future tools...]  # Add more tools here
│   │
│   └── utils/                 # Utility functions
│
└── tutorials/                 # Tutorial pages
    ├── projectile-motion/
    │   ├── index.html         # Tutorial page
    │   └── main.js            # Tutorial logic
    │
    ├── 2d-graphs/
    │   ├── index.html
    │   └── main.js
    │
    └── [future tutorials...]/
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visualization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   ```bash
   cp config.example.js config.js
   ```

   Edit `config.js` and add your Gemini API key:
   ```javascript
   export const config = {
     GEMINI_API_KEY: 'your-api-key-here'
   };
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

## Architecture

### 1. Centralized Tools Manager

The `ToolsManager` class (`src/core/tools-manager.js`) provides a unified system for managing all visualization tools.

**Key Features:**
- Single source of truth for tool configuration
- Easy control over zoom, rotation, pan
- Consistent camera and coordinate system management
- Simple tool switching and registration

**Usage Example:**
```javascript
import { ToolsManager } from './src/core/tools-manager.js';
import { Projectile } from './src/tools/projectile.js';

const container = document.getElementById('visualization');
const toolsManager = new ToolsManager(container);

// Register a tool
toolsManager.registerTool('projectile', Projectile, {
  config: {
    enableZoom: false,
    enableRotate: false,
    enablePan: false
  }
});

// Switch to and use the tool
toolsManager.switchTool('projectile');
toolsManager.executeToolMethod('launch', 20, 45, 0, 0, 0xe74c3c);

// Start animation
toolsManager.startAnimation();
```

**Configuration Options:**
```javascript
{
  allowUserInput: true,        // Enable/disable user input
  enableZoom: false,           // Allow camera zoom
  enableRotate: false,         // Allow camera rotation
  enablePan: false,            // Allow camera panning
  showAxes: true,              // Show coordinate axes
  showGrid: true,              // Show grid
  backgroundColor: 0xffffff,   // Background color
  cameraPosition: { x: 0, y: 0, z: 4 },
  cartesianRange: [[-10, 10], [-10, 10], [-2, 2]],
  cartesianScale: [2, 2, 1]
}
```

### 2. Tutorial Page Structure

Each tutorial follows a consistent layout designed for optimal learning:

1. **Introduction Section**
   - Concept overview
   - Key terms and definitions
   - Important formulas

2. **Interactive Visualization**
   - Live, controllable simulation
   - Manual input controls
   - Real-time calculated values

3. **Example Problems**
   - Step-by-step solutions
   - Different difficulty levels
   - Expandable solution sections

4. **Summary**
   - Key takeaways
   - Real-world applications
   - Review of concepts

5. **AI Chat Section** (Bottom of page)
   - Ask custom questions
   - Request personalized visualizations
   - Get explanations tailored to your needs

### 3. AI Chat Integration

The chat system works through several components:

**Tool Registry** (`src/core/tool-registry.js`)
- Registers tools with descriptions and parameters
- Generates AI system prompts
- Routes tool execution requests

**Chat Controller** (`src/core/chat-controller.js`)
- Manages chat UI
- Coordinates between user, AI, and visualizations
- Handles tool execution from AI commands

**Tool Definitions** (`src/core/tool-definitions.js`)
- Defines available tools for AI
- Specifies parameters, examples, and handlers
- Makes tools discoverable by AI

**AI Command Format:**
```json
{
  "action": "visualize",
  "tool": "projectile_motion",
  "parameters": {
    "v0": 20,
    "theta": 45,
    "x0": 0,
    "y0": 0
  }
}
```

## Adding New Content

### Adding a New Tool

1. **Create the tool class** in `src/tools/your-tool.js`:
   ```javascript
   export class YourTool {
     constructor(mathbox, view, cartesian, three) {
       this.mathbox = mathbox;
       this.view = view;
       this.cartesian = cartesian;
       this.three = three;
     }

     // Your tool methods
     doSomething(param1, param2) {
       // Implementation
     }

     destroy() {
       // Cleanup
     }
   }
   ```

2. **Register with ToolsManager**:
   ```javascript
   toolsManager.registerTool('your-tool', YourTool, {
     config: { /* tool-specific config */ }
   });
   ```

3. **Add to tool definitions** in `src/core/tool-definitions.js`:
   ```javascript
   toolRegistry.registerTool({
     id: 'your_tool',
     name: 'Your Tool Name',
     description: 'What it does',
     category: 'physics_category',
     parameters: [
       {
         name: 'param1',
         type: 'number',
         description: 'Description',
         required: true
       }
     ],
     examples: [
       'Show me your tool with param1=5'
     ],
     handler: async (params, toolsManager) => {
       toolsManager.switchTool('your-tool');
       toolsManager.executeToolMethod('doSomething', params.param1);
       return { success: true };
     }
   });
   ```

### Adding a New Tutorial

1. **Create tutorial folder**:
   ```bash
   mkdir -p tutorials/your-topic
   ```

2. **Create `index.html`** (copy from `tutorials/projectile-motion/index.html`)
   - Update title, content sections
   - Keep the structure (intro, viz, examples, summary, chat)

3. **Create `main.js`** (copy from `tutorials/projectile-motion/main.js`)
   - Initialize ToolsManager
   - Register relevant tools
   - Set up controls
   - Initialize chat system

4. **Add to homepage** in `index.html`:
   ```html
   <a href="tutorials/your-topic/index.html" class="course-card" data-category="your-category">
     <div class="course-thumbnail">
       <i class="fas fa-your-icon"></i>
       <span class="course-badge">Interactive</span>
     </div>
     <div class="course-content">
       <h4 class="course-title">Your Topic Title</h4>
       <p class="course-description">Description...</p>
       <div class="course-meta">
         <span><i class="fas fa-clock"></i> 25 min</span>
         <span class="difficulty beginner">Beginner</span>
       </div>
     </div>
   </a>
   ```

## Available Tools

### 1. 2D Graph Plotter
**File:** `src/tools/2dgraph.js`
**Purpose:** Plot points on 2D Cartesian coordinates with animated path visualization

**Methods:**
- `addPoint(x, y, color)` - Plot a point at (x, y)

### 2. Projectile Motion
**File:** `src/tools/projectile.js`
**Purpose:** Simulate projectile motion with gravity

**Methods:**
- `launch(v0, theta, x0, y0, color)` - Launch a projectile

## Configuration

### Tools Manager Configuration

Update tool configuration globally or per-tool:

```javascript
// Global configuration
toolsManager.updateConfig({
  enableZoom: true,
  backgroundColor: 0xf0f0f0
});

// Per-tool configuration
toolsManager.registerTool('tool-name', ToolClass, {
  config: {
    enableZoom: false,
    cartesianRange: [[-20, 20], [-20, 20], [-2, 2]]
  }
});
```

### AI Chat Configuration

The chat system automatically discovers tools through the registry. To customize AI behavior, edit the system prompt in `src/core/tool-registry.js`.

## Design Philosophy

1. **Separation of Concerns**
   - Tools are independent and reusable
   - Chat system works with any tool
   - UI and logic are separated

2. **Scalability**
   - Easy to add new tools
   - Easy to add new tutorials
   - Centralized configuration

3. **User Experience**
   - Consistent navigation
   - Progressive disclosure (theory → practice → chat)
   - Mobile-responsive design

4. **Developer Experience**
   - Clear project structure
   - Minimal boilerplate
   - Reusable components

## Development Tips

1. **Testing Tools**
   - Use browser console to test tool methods directly
   - Example: `toolsManager.executeToolMethod('launch', 20, 45, 0, 0, 0xe74c3c)`

2. **Debugging Chat**
   - Check console for tool registration messages
   - Verify API key in config.js
   - Check network tab for API calls

3. **Styling**
   - Edit `public/css/tutorial.css` for shared styles
   - Add custom styles in individual tutorial HTML files

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires WebGL support.

## License

MIT

## Contributing

Contributions welcome! Please:
1. Follow the existing project structure
2. Add documentation for new tools
3. Include examples for AI integration
4. Test across different browsers

## Troubleshooting

**Issue:** API key not working
- **Solution:** Verify key in config.js, check console for errors

**Issue:** Visualization not loading
- **Solution:** Check browser console, verify WebGL support

**Issue:** Chat not responding
- **Solution:** Ensure API key is valid, check network connection

**Issue:** Tool not found in chat
- **Solution:** Verify tool is registered in tool-definitions.js

## Future Enhancements

- [ ] More physics tools (waves, circuits, optics)
- [ ] User progress tracking
- [ ] Interactive quizzes
- [ ] Video explanations
- [ ] Mobile app
- [ ] Multiplayer/collaborative mode

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with:** Three.js, MathBox, Gemini API, and passion for education 🚀
