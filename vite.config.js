import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this as a project site under /scolly-reading/
  base: command === 'build' ? '/scolly-reading/' : '/',
  plugins: [svelte()],
}))
