import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true }), vueDevTools()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/refresh': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/csrf': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/inventory': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
})
