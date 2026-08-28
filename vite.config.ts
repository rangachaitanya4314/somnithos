import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function dreamAnalysisApiPlugin(): Plugin {
  return {
    name: 'dream-analysis-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/analyze-dream' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')
              const { handleAnalyzeDreamRequest } = await import('./src/server/api/analyzeDreamHandler')
              const apiRes = await handleAnalyzeDreamRequest(parsed)
              res.statusCode = apiRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(apiRes.body))
            } catch {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Internal server error' }))
            }
          })
          return
        }

        if (req.url === '/api/generate-artwork' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')
              const { handleGenerateArtworkRequest } = await import('./src/server/api/generateArtworkHandler')
              const apiRes = await handleGenerateArtworkRequest(parsed)
              res.statusCode = apiRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(apiRes.body))
            } catch {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Internal server error' }))
            }
          })
          return
        }

        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/analyze-dream' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')
              const { handleAnalyzeDreamRequest } = await import('./src/server/api/analyzeDreamHandler')
              const apiRes = await handleAnalyzeDreamRequest(parsed)
              res.statusCode = apiRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(apiRes.body))
            } catch {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Internal server error' }))
            }
          })
          return
        }

        if (req.url === '/api/generate-artwork' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')
              const { handleGenerateArtworkRequest } = await import('./src/server/api/generateArtworkHandler')
              const apiRes = await handleGenerateArtworkRequest(parsed)
              res.statusCode = apiRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(apiRes.body))
            } catch {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Internal server error' }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dreamAnalysisApiPlugin()]
})
