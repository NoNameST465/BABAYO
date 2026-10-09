import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Ensures relative paths work on GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
