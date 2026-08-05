# Asymptote Learn

Interactive physics tutorials and visualizations with optional Gemini-powered tutoring.

[Live site](https://asymptotelearn.netlify.app)

## Highlights

- Real-time Three.js and MathBox simulations
- Tutorials with theory, examples, quizzes, and practice
- Accessible keyboard, screen-reader, and reduced-motion support
- Lazy-loaded visualizations with enforced bundle budgets

## Run locally

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm ci
npm run dev
```

Visualizations work without credentials. For AI features, copy `.env.example` to
an ignored `.env`, set the server-side `GEMINI_API_KEY`, and run with Netlify Dev
so `/api/gemini/*` is available. Never expose the key in browser code, `config.js`,
`localStorage`, or a `VITE_` variable.

## Verify changes

```bash
npm test
npm run build
npm run audit
```

Run all checks with `npm run verify`.

## Project layout

```text
src/core/          Shared application and AI systems
src/tools/         Interactive visualization tools
tutorials/         Physics tutorial pages
netlify/functions/ Server-side Gemini endpoints
scripts/           Build and verification utilities
```

## Deployment

Netlify builds the site with settings and security headers from `netlify.toml`.
Set `GEMINI_API_KEY` as a server-side Netlify environment variable.

Report vulnerabilities privately according to [SECURITY.md](SECURITY.md).
Licensed under the [MIT License](LICENSE).
