import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

const LOG_FILE = path.resolve('./debug.log')

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'dev-logger',
      configureServer(server) {
        server.middlewares.use('/dev-log', (req, res) => {
          if (req.method !== 'POST') { res.end(); return }
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            fs.appendFileSync(LOG_FILE, body + '\n')
            res.end('ok')
          })
        })
      }
    }
  ],
  base: './',
  server: {
    allowedHosts: ['.loca.lt', 'bright-buses-train.loca.lt', 'grumpy-zoos-say.loca.lt']
  },
  test: {
    environment: 'jsdom'
  }
})

