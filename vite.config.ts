import { readdirSync, writeFileSync } from 'fs'
import { resolve, relative, join, sep } from 'path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

// Automatically find all HTML entry points in the project root
const htmlEntries = Object.fromEntries(
  readdirSync(__dirname)
    .filter(file => file.endsWith('.html'))
    .map(file => [file.replace('.html', ''), resolve(__dirname, file)])
)

// Image extensions to include in the manifest
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i

// Recursively collect image files, returning paths relative to `baseDir`
// (using forward slashes) so they can be appended to the carousel's base URL.
function walkImages(dir: string, baseDir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkImages(full, baseDir))
    } else if (IMAGE_EXTENSIONS.test(entry.name)) {
      out.push(relative(baseDir, full).split(sep).join('/'))
    }
  }
  return out
}

// Plugin that generates a manifest of images in public/images/ (recursively)
// so the carousel can discover them at runtime without hashing
function imageManifestPlugin(): Plugin {
  function generateManifest() {
    const imagesDir = resolve(__dirname, 'public/images')
    try {
      const files = walkImages(imagesDir, imagesDir).sort()
      writeFileSync(
        resolve(imagesDir, 'manifest.json'),
        JSON.stringify(files, null, 2)
      )
    } catch {
      // No images directory yet
    }
  }

  return {
    name: 'image-manifest',
    buildStart() {
      generateManifest()
    },
    configureServer(server) {
      // Regenerate manifest when images change during dev
      server.watcher.on('all', (_event, path) => {
        if (path.includes('public/images') && !path.endsWith('manifest.json')) {
          generateManifest()
        }
      })
      generateManifest()
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    imageManifestPlugin(),
  ],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
})
