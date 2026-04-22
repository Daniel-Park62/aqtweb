import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir:'public',
    emptyOutDir:false
  },
  resolve: {
    alias: {
      fs: 'rollup-plugin-node-polyfills/polyfills/empty',
      path: 'rollup-plugin-node-polyfills/polyfills/path',
    },
  },
  // compilerOptions: { "forceConsistentCasingInFileNames": false } 
})
