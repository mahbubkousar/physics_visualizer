# Asymptote Learn

Interactive physics education platform with AI-powered visualizations.

🌐 **Live Site:** [asymptotelearn.netlify.app](https://asymptotelearn.netlify.app)

## Features

- **Interactive Visualizations** - Real-time physics simulations using Three.js & MathBox
- **AI Tutoring** - Gemini-powered chat for personalized explanations
- **Structured Tutorials** - Theory, examples, quizzes, and practice problems
- **Extensible Architecture** - Easy to add new physics tools and tutorials

## Quick Start

### Local Development

```bash
# Start local server
python3 -m http.server 8080

# Open browser
open http://localhost:8080
```

### Configuration

The API key is already configured in `config.js` for the deployed site. For local development with a different key, edit:

```javascript
// config.js
export const config = {
  GEMINI_API_KEY: 'your-api-key-here'
};
```

Get your API key: [Google AI Studio](https://aistudio.google.com/app/apikey)

## Project Structure

```
visualization/
├── index.html              # Homepage
├── config.js               # Configuration
├── src/
│   ├── core/               # Core systems (ToolsManager, Chat, AI)
│   └── tools/              # Visualization tools (Projectile, Graph2D)
└── tutorials/
    ├── projectile-motion/  # Projectile motion tutorial
    └── 2d-graphs/          # 2D graphing tutorial
```

## Adding New Content

### Add a Tool

1. Create `src/tools/your-tool.js`
2. Register with `ToolsManager`
3. Add to `tool-definitions.js` for AI integration

### Add a Tutorial

1. Create `tutorials/your-topic/` folder
2. Copy structure from existing tutorial
3. Add link to `index.html` homepage

## Technology Stack

- **Visualization:** Three.js r137, MathBox
- **AI:** Google Gemini 2.5 Flash
- **Deployment:** Netlify
- **Math Rendering:** MathJax

## Deployment

The site auto-deploys to Netlify on every push to `master`. Configuration:
- `netlify.toml` - Build settings and headers
- `_headers` - Additional HTTP headers

## License

MIT

---

**Built by Asymptote Labs** | [asymptotelabs.github.io](https://asymptotelabs.github.io)
