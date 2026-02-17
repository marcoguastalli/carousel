import { readdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Automatically find all HTML entry points in the project root
const htmlEntries = Object.fromEntries(
  readdirSync(__dirname)
    .filter(file => file.endsWith('.html'))
    .map(file => [file.replace('.html', ''), resolve(__dirname, file)])
)

// Image extensions to include in the manifest
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i

// Plugin that generates a manifest of images in public/images/
// so the carousel can discover them at runtime without hashing
function imageManifestPlugin(): Plugin {
  function generateManifest() {
    const imagesDir = resolve(__dirname, 'public/images')
    try {
      const files = readdirSync(imagesDir)
        .filter(file => IMAGE_EXTENSIONS.test(file))
        .sort()
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
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    imageManifestPlugin(),
  ],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
})
