import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],
  // Prevent esbuild from pre-bundling WASM packages — they use
  // `new URL('./file.wasm', import.meta.url)` internally which breaks when
  // esbuild rewrites the module. The plugin handles WASM loading instead.
  optimizeDeps: {
    exclude: ['@aztec/bb.js', '@noir-lang/noir_js', '@noir-lang/noirc_abi', '@noir-lang/acvm_js'],
  },
  server: {
    // Required for @aztec/bb.js (Barretenberg WASM) to use SharedArrayBuffer
    // and multi-threaded proving. Without these headers the prover falls back
    // to single-threaded mode which takes 10+ minutes per proof.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  // Same headers needed for the production preview server
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
