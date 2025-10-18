import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'tinymce': resolve(__dirname, 'node_modules/tinymce')
    }
  },
  optimizeDeps: {
    include: ['tinymce']
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173,      // 指定端口
    strictPort: true  // 如果端口被占用则报错
  }
})