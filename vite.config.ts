import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Fit2Any — 运动数据格式转换',
        short_name: 'Fit2Any',
        description: 'FIT / GPX / TCX 运动数据格式互转工具，数据本地处理',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // 预缓存所有构建产物
        globPatterns: ['**/*.{js,css,html,svg}'],
        // FIT 解析库较大，单独缓存策略
        runtimeCaching: [
          {
            urlPattern: /.*fit-parser.*\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'fit2any-fit-parser',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 天
              },
            },
          },
        ],
      },
    }),
  ],
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
    rollupOptions: {
      output: {
        manualChunks: {
          'fit-parser': ['fit-file-parser'],
          'zip': ['jszip', 'file-saver'],
        },
      },
    },
  },
})
