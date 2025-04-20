// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,        // bind to localhost:3000 strictly :contentReference[oaicite:0]{index=0}
    strictPort: true,  // exit if 3000 is taken :contentReference[oaicite:1]{index=1}
    host: true,        // listen on all network interfaces :contentReference[oaicite:2]{index=2}
    proxy: {           // forward /api/* to backend to bypass CORS :contentReference[oaicite:3]{index=3}
      '/api': {
        target: 'http://localhost:4000',  // your Express backend :contentReference[oaicite:4]{index=4}
        changeOrigin: true,               // rewrite Host header to target :contentReference[oaicite:5]{index=5}
        secure: false                     // allow self-signed certs if using HTTPS
      }
    }
  },
  build: {
    outDir: 'dist',       // production build folder
    emptyOutDir: true,    // clear old files before build
    sourcemap: true       // generate source maps
  }
})
