import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        /^@mapbox\/node-pre-gyp\/.*/,
        "mock-aws-s3",
        "aws-sdk",
        "nock"
      ]
    }
  },
  optimizeDeps: {
    exclude: [
      '@mapbox/node-pre-gyp',
      'mock-aws-s3',
      'aws-sdk',
      'nock'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})