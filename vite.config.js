import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    allowedHosts: ['.loca.lt', 'bright-buses-train.loca.lt', 'grumpy-zoos-say.loca.lt']
  },
  test: {
    environment: 'jsdom'
  }
})
