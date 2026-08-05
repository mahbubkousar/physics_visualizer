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
# Install the exact locked dependencies
npm ci

# Run the Vite development server
npm run dev
```

To run AI features locally, create an ignored `.env` from `.env.example`, set a
server-side `GEMINI_API_KEY`, and run the site with Netlify Dev so the function
routes under `/api/gemini/*` are available.

### Configuration

The visualization features run without credentials. AI features call Gemini
through Netlify Functions; never put an API key in `config.js`, browser code,
`localStorage`, or a `VITE_` environment variable. Local server-side secrets
belong in an ignored `.env` file based on `.env.example`. Configure
`GEMINI_API_KEY` in Netlify's environment variables for deployment.

## Project Structure

```
visualization/
├── index.html              # Homepage
├── config.js               # Public, non-secret browser configuration
├── netlify/functions/      # Server-side Gemini proxy endpoints
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

- **Visualization:** Three.js r139, MathBox 2.3.1
- **AI:** Google Gemini 2.5 Flash
- **Deployment:** Netlify
- **Math Rendering:** MathJax

## Deployment

The site auto-deploys to Netlify on every push to `master`. Configuration:
- `netlify.toml` - Build settings and the browser security policy

## Security

AI credentials are server-only, requests are size- and rate-limited, and the
public site enforces a Content Security Policy and other defensive headers.
Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

MIT

---

**Built by Asymptote Labs** | [asymptotelabs.github.io](https://asymptotelabs.github.io)
