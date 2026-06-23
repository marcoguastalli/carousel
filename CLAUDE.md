# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (see `packageManager` in package.json).

```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server (localhost:5173)
pnpm build        # Type-check + production build (tsc -b && vite build)
pnpm lint         # Run ESLint
pnpm preview      # Preview production build locally
```

No test suite is configured.

## Architecture

This is a reusable, framework-agnostic **web component** (no runtime dependencies), bundled with Vite + TypeScript.

- [src/image-carousel.ts](src/image-carousel.ts) — The `<image-carousel>` custom element. Self-contained: all logic, markup, and styles live here, rendered into a Shadow DOM (styles are encapsulated and can't leak in/out). Configured via HTML attributes (`interval`, `autoplay`, `sort`, `manifest`, `base`, `images`) — all reactive via `attributeChangedCallback`. Fires a bubbling `change` event on slide change.
- [src/main.ts](src/main.ts) — Demo entry; only imports `image-carousel.ts` to register the element.
- [index.html](index.html) — Demo page; uses `<image-carousel sort>`.

There is no React in this project — do not add it.

**Image discovery flow:** The Vite config ([vite.config.ts](vite.config.ts)) includes a custom `imageManifestPlugin` that scans `public/images/` at build-start and during dev-server watch events, writing a `manifest.json` file listing all image filenames. At runtime the component fetches the manifest (default `/images/manifest.json`, override with the `manifest` attribute) — this avoids Vite's asset hashing while still enabling hot-reload when images are added/removed. Alternatively, pass an explicit `images="a.jpg, b.png"` attribute to skip the fetch entirely.

**Adding images:** Drop `.jpg`, `.jpeg`, `.png`, `.gif`, or `.webp` files anywhere under `public/images/`. The scan is **recursive**; manifest entries are paths relative to `public/images/` (forward slashes, e.g. `Linux/linux-commands.jpg`), which the component appends to its `base`. The manifest is regenerated automatically in dev mode. Captions are derived from the **basename** (subdirectory stripped), extension removed, hyphens/underscores → spaces, title-cased.

**Shared header:** [public/header.js](public/header.js) is a vanilla JS module loaded via `<script type="module">` in [index.html](index.html). It programmatically inserts a `<header>` and injects shared styles from [public/styles.css](public/styles.css).

**Multi-page build:** `vite.config.ts` auto-discovers all `.html` files in the project root as Rollup entry points, so additional pages can be added alongside `index.html`.
