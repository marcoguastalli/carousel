# &lt;image-carousel&gt;

A reusable, framework-agnostic image carousel **web component**. No runtime
dependencies — drop it into any HTML, React, Vue, or legacy page.

```html
<script type="module" src="/assets/image-carousel.js"></script>

<image-carousel sort autoplay interval="3000"></image-carousel>
```

## Attributes

| Attribute  | Type    | Default                 | Description                                   |
|------------|---------|-------------------------|-----------------------------------------------|
| `interval` | number  | `2000`                  | Auto-play interval in ms.                     |
| `autoplay` | boolean | off                     | Start auto-playing on load.                   |
| `sort`     | boolean | off                     | Sort images by caption (A→Z).                 |
| `manifest` | string  | `/images/manifest.json` | URL of a JSON array of filenames.             |
| `base`     | string  | `/images/`              | Path prepended to each filename.              |
| `images`   | string  | —                       | Comma-separated filenames (skips the manifest).|

All attributes are reactive — changing one re-renders the carousel.

Supplying images explicitly (no build step needed):

```html
<image-carousel base="/pics/" images="one.jpg, two.png, three.webp"></image-carousel>
```

## Events

Fires `change` (bubbles) on slide change: `e.detail.index`.

## Styling

The component uses Shadow DOM, so outside CSS can't leak in. Override the
accent colors via CSS custom properties on the host:

```css
image-carousel {
  --ic-accent: #43a047;
  --ic-accent-dark: #1b5e20;
  --ic-bar-bg: #1a1a1a;
}
```

## Image discovery

By default the component fetches `manifest.json` — a list of filenames
generated at build/dev time by the Vite `image-manifest` plugin
(see [vite.config.ts](vite.config.ts)). Drop `.jpg/.jpeg/.png/.gif/.webp`
files into `public/images/` and the manifest regenerates automatically in dev.
Filenames become captions (extension stripped, hyphens/underscores → spaces,
title-cased).

## Commands

This project uses **pnpm**.

```bash
pnpm install      # Install dependencies
pnpm dev          # Dev server (localhost:5173)
pnpm build        # Type-check + production build
pnpm lint         # ESLint
pnpm preview      # Preview production build
```
