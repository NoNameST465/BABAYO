import { defineConfig } from 'vite'

export default defineConfig({
  base: '/BABAYO/',
  plugins: [{
    name: 'resolve-babayo-html-paths',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/\b(src|href)="BABAYO\//g, '$1="/')
      }
    }
  }],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
