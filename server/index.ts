import http from 'http';
import fs from 'fs';
import path from 'path';
import { handleAnalyzeDreamRequest } from '../src/server/api/analyzeDreamHandler';
import { handleGenerateArtworkRequest } from '../src/server/api/generateArtworkHandler';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // -------------------------------------------------------------
  // 1. API Endpoints (Explicitly isolated from SPA fallback)
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/') || pathname === '/api') {
    if (pathname === '/api/analyze-dream' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const apiRes = await handleAnalyzeDreamRequest(parsed);
          res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(apiRes.body));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err?.message || 'Invalid JSON request payload.' }));
        }
      });
      return;
    }

    if (pathname === '/api/generate-artwork' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const apiRes = await handleGenerateArtworkRequest(parsed);
          res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(apiRes.body));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err?.message || 'Invalid JSON request payload.' }));
        }
      });
      return;
    }

    if (pathname === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'somnithos-backend-api' }));
      return;
    }

    // Explicit 404 for unknown /api/* requests
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
    return;
  }

  // -------------------------------------------------------------
  // 2. Static Assets & SPA Fallback (Serving dist/)
  // -------------------------------------------------------------
  if (req.method === 'GET' || req.method === 'HEAD') {
    const distDir = path.resolve(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distDir, 'index.html');

    // Normalize path to prevent directory traversal
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const candidatePath = path.join(distDir, safePath);

    let targetFile = indexHtmlPath;

    if (safePath !== '' && safePath !== '/' && safePath !== '\\') {
      try {
        if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
          targetFile = candidatePath;
        }
      } catch {
        targetFile = indexHtmlPath;
      }
    }

    try {
      if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
        const ext = path.extname(targetFile).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const fileContent = fs.readFileSync(targetFile);

        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': fileContent.length
        });

        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(fileContent);
        }
        return;
      }
    } catch {
      // Fall through to 503 if dist is missing
    }

    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Frontend build not found. Please run npm run build first.' }));
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Method not allowed' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Somnithos server running on http://0.0.0.0:${PORT}`);
  });
}

export default server;
