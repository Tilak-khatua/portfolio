import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
    // WSL2 on /mnt/c: inotify doesn't fire for Windows-drive files, so poll for HMR
    watch: { usePolling: true, interval: 300 },
  },
})
