import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const target = env.VITE_API_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [vue(), vuetify({ autoImport: true }), vueDevTools(), cloudflare()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      proxy: {
        '/api':     { target, changeOrigin: true, secure: false },
        '/csrf':    { target, changeOrigin: true, secure: false },
        '/refresh': { target, changeOrigin: true, secure: false },
      }
    }
  };
})