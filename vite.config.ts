import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    // P2 引入 fit-file-parser / jszip / file-saver 后启用分包
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       'fit-parser': ['fit-file-parser'],
    //       'zip': ['jszip', 'file-saver'],
    //     },
    //   },
    // },
  },
})
