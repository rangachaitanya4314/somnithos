import http from 'http';
import assert from 'assert';

process.env.NODE_ENV = 'test';
import server from '../../server/index';

async function runTests() {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 3001;

  const fetchLocal = (path: string, method: string = 'GET', body: any = null): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: data }));
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  console.log('--- 1. Testing GET / (Root Frontend) ---');
  const rootRes = await fetchLocal('/');
  assert.strictEqual(rootRes.status, 200, 'GET / should return 200');
  assert.ok(rootRes.headers['content-type']?.includes('text/html'), 'Content-Type should be text/html');
  assert.ok(rootRes.body.includes('<div id="root"></div>'), 'Should serve dist/index.html with root div');
  console.log('✓ PASS: GET / serves dist/index.html');

  console.log('--- 2. Testing SPA Route Fallback (/symbols) ---');
  const spaRes = await fetchLocal('/symbols');
  assert.strictEqual(spaRes.status, 200, 'GET /symbols should return 200');
  assert.ok(spaRes.headers['content-type']?.includes('text/html'), 'Content-Type should be text/html');
  assert.ok(spaRes.body.includes('<div id="root"></div>'), 'SPA route falls back to index.html');
  console.log('✓ PASS: GET /symbols falls back to dist/index.html');

  console.log('--- 3. Testing GET /api/health ---');
  const healthRes = await fetchLocal('/api/health');
  assert.strictEqual(healthRes.status, 200, 'GET /api/health should return 200');
  assert.ok(healthRes.body.includes('"status":"ok"'), 'Health body includes status ok');
  console.log('✓ PASS: GET /api/health returns 200 ok');

  console.log('--- 4. Testing Unknown /api/* (Should 404, NOT SPA HTML) ---');
  const api404Res = await fetchLocal('/api/unknown-endpoint');
  assert.strictEqual(api404Res.status, 404, 'Unknown API route should return 404');
  assert.ok(api404Res.body.includes('Route not found'), 'Returns JSON route not found');
  assert.strictEqual(api404Res.body.includes('<div id="root"></div>'), false, 'Never returns SPA HTML for API route');
  console.log('✓ PASS: Unknown /api/* route returns 404 JSON, not SPA fallback');

  console.log('--- 5. Testing POST /api/analyze-dream validation ---');
  const postApiRes = await fetchLocal('/api/analyze-dream', 'POST', {});
  assert.strictEqual(postApiRes.status, 400, 'Empty POST body should return 400');
  assert.ok(postApiRes.body.includes('Dream narrative is required'), 'Returns validation error');
  console.log('✓ PASS: POST /api/analyze-dream validates payload correctly');

  server.close();
  console.log('====================================================');
  console.log('ALL SERVER & DIST/ ROUTING TESTS PASSED (100%)');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
