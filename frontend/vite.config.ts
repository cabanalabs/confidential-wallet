import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {nodePolyfills} from "vite-plugin-node-polyfills";
import inject from '@rollup/plugin-inject'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),nodePolyfills({globals: {Buffer: false, global: true, process: true}})],
  build: {
    rollupOptions: {
      plugins: [
        inject({ Buffer: ['buffer', 'Buffer'] }),
        nodePolyfills({
          globals: {
            Buffer: true,
            global: true,
            process: true,
          }
        })
      ]
    }
  }
})