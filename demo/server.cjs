const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const sessions = new Set();
const messages = [];
const uploads = new Map();
const port = Number(process.env.PORT || process.env.DEMO_PORT || 3000);
const send = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/health') return send(res, 200, { status: 'ok' });
  if (url.pathname === '/api/login' && req.method === 'POST') {
    let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 10000) return send(res, 413, { error: 'Too large' }); }
    let body; try { body = JSON.parse(raw); } catch { return send(res, 400, { error: 'Invalid JSON' }); }
    if (body.email !== 'tester@example.test' || body.password !== 'DemoPassword123!') return send(res, 401, { error: 'Invalid email or password' });
    const token = randomUUID(); sessions.add(token);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Lax; Path=/`);
    return send(res, 200, { authenticated: true });
  }
  if (url.pathname.startsWith('/api/')) {
    const token = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('session='))?.slice(8);
    if (!sessions.has(token)) return send(res, 401, { error: 'Authentication required' });
    if (url.pathname === '/api/me') return send(res, 200, { email: 'tester@example.test' });
    if (url.pathname === '/api/logout' && req.method === 'POST') {
      sessions.delete(token); res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); return send(res, 200, {});
    }
    if (url.pathname === '/api/uploads' && req.method === 'POST') {
      const name = url.searchParams.get('name') || '';
      if (!/\.(txt|csv)$/i.test(name)) return send(res, 400, { error: 'Unsupported file type' });
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 1024 * 1024) return send(res, 413, { error: 'File exceeds 1 MB limit' });
        chunks.push(chunk);
      }
      const upload = { id: randomUUID(), name, size, text: Buffer.concat(chunks).toString('utf8') };
      uploads.set(upload.id, { ...upload, owner: token });
      return send(res, 201, upload);
    }
    if (url.pathname.startsWith('/api/uploads/') && req.method === 'GET') {
      const upload = uploads.get(url.pathname.slice('/api/uploads/'.length));
      if (!upload || upload.owner !== token) return send(res, 404, { error: 'Upload not found' });
      const { owner, ...result } = upload; return send(res, 200, result);
    }
    if (url.pathname === '/api/messages' && req.method === 'POST') {
      let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 10000) return send(res, 413, { error: 'Too large' }); }
      let body; try { body = JSON.parse(raw); } catch { return send(res, 400, { error: 'Invalid JSON' }); }
      if (typeof body.to !== 'string' || !/^[^@\s]+@example\.test$/.test(body.to)) return send(res, 400, { error: 'Use an example.test email address' });
      const message = { id: randomUUID(), to: body.to, subject: 'You are invited', text: 'Welcome to the demo workspace.' }; messages.push(message);
      return send(res, 201, message);
    }
    if (url.pathname === '/api/messages' && req.method === 'GET') return send(res, 200, messages.filter(m => m.to === url.searchParams.get('to')));
    return send(res, 404, { error: 'Not found' });
  }
  const files = { '/': 'index.html', '/login': 'index.html', '/app': 'index.html', '/app.js': 'app.js' };
  const file = files[url.pathname];
  if (!file || req.method !== 'GET') return send(res, 404, { error: 'Not found' });
  res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'public', file)));
}).listen(port, '127.0.0.1', () => console.log(`Demo listening on port ${port}`));
