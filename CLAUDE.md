# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

No test suite is configured.

## Architecture

This is a single-page React + TypeScript app built with Vite. The entire application lives in two files:

- [src/App.tsx](src/App.tsx) — All application logic and JSX. Contains the `SLIDESHOW_CONFIG` object at the top for easy customization of auto-play interval, start behavior, and sort order.
- [src/App.css](src/App.css) — All component styles (carousel, lightbox, indicators, controls).

**Image discovery flow:** The Vite config ([vite.config.ts](vite.config.ts)) includes a custom `imageManifestPlugin` that scans `public/images/` at build-start and during dev-server watch events, writing a `manifest.json` file listing all image filenames. At runtime, `App.tsx` fetches `/images/manifest.json` to populate the carousel — this avoids Vite's asset hashing while still enabling hot-reload when images are added/removed.

**Adding images:** Drop `.jpg`, `.jpeg`, `.png`, `.gif`, or `.webp` files into `public/images/`. The manifest is regenerated automatically in dev mode. Filenames are converted to captions by stripping the extension and replacing hyphens/underscores with spaces (title-cased).

**Shared header:** [public/header.js](public/header.js) is a vanilla JS module loaded via `<script type="module">` in [index.html](index.html). It programmatically inserts a `<header>` and injects shared styles from [public/styles.css](public/styles.css). This runs outside React.

**Multi-page build:** `vite.config.ts` auto-discovers all `.html` files in the project root as Rollup entry points, so additional pages can be added alongside `index.html`.

**React Compiler:** Enabled via `babel-plugin-react-compiler` in the Vite React plugin config.
