#!/usr/bin/env node
/* dev-server.js — local dev server + data editor. Run:  node dev-server.js  (from site/), then open http://localhost:8765/admin
   Serves the site as static files and adds:
     GET  /admin                 the editor UI (admin.html)
     GET  /api/files             list of editable data files and the SPS keys each defines
     GET  /api/data/<file>       { key: value, ... } parsed from data/<file>.js
     POST /api/data/<file>       body { key, value } — rewrites that key in data/<file>.js (other keys and comments kept), keeps a .bak
   Local only. Never deploy this file's behavior; GitHub Pages serves data/*.js as plain static files. */
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = __dirname, PORT = Number(process.env.PORT || 8765);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const DATA = path.join(ROOT, 'data');

function loadFile(name) {
  const src = fs.readFileSync(path.join(DATA, name + '.js'), 'utf8');
  const ctx = { console }; ctx.window = ctx; vm.runInNewContext(src, ctx, { filename: name + '.js' });
  return { src, sps: ctx.SPS || {} };
}
function listFiles() {
  return fs.readdirSync(DATA).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).map(name => {
    try { return { name, keys: Object.keys(loadFile(name).sps) }; } catch (e) { return { name, keys: [], error: e.message }; }
  });
}
// Replace the `SPS.<key> = ...;` statement in a data file with freshly serialized JSON. Statement boundaries are found by
// scanning from the assignment to the first `;` that sits at bracket depth 0 outside strings/comments.
function replaceKey(src, key, value) {
  const re = new RegExp('(^|\\n)(\\s*)SPS\\.' + key.replace(/[.$]/g, '\\$&') + '\\s*=\\s*', 'm');
  const m = re.exec(src); if (!m) throw new Error('key not found in file: ' + key);
  const start = m.index + m[0].length; let i = start, depth = 0, q = null, esc = false;
  for (; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (q) { if (esc) { esc = false; } else if (c === '\\') { esc = true; } else if (c === q) { q = null; } continue; }
    if (c === '/' && n === '/') { i = src.indexOf('\n', i); if (i < 0) i = src.length; continue; }
    if (c === '/' && n === '*') { i = src.indexOf('*/', i) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') depth--;
    else if (c === ';' && depth === 0) break;
  }
  const json = JSON.stringify(value, null, 2);
  return src.slice(0, start) + json + src.slice(i);
}
function send(res, code, body, type) { res.writeHead(code, { 'Content-Type': type || 'application/json', 'Cache-Control': 'no-store' }); res.end(body); }

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);
  try {
    if (p === '/admin' || p === '/admin/') return send(res, 200, fs.readFileSync(path.join(ROOT, 'admin.html')), MIME['.html']);
    if (p === '/api/files') return send(res, 200, JSON.stringify(listFiles()));
    const dm = p.match(/^\/api\/data\/([a-z0-9-]+)$/);
    if (dm) {
      const name = dm[1];
      if (req.method === 'GET') return send(res, 200, JSON.stringify(loadFile(name).sps));
      if (req.method === 'POST') {
        let body = ''; req.on('data', d => body += d); req.on('end', () => {
          try {
            const { key, value } = JSON.parse(body);
            const file = path.join(DATA, name + '.js'); const src = fs.readFileSync(file, 'utf8');
            const out = replaceKey(src, key, value);
            const check = { console }; check.window = check; vm.runInNewContext(out, check);      // must still parse
            fs.writeFileSync(file + '.bak', src); fs.writeFileSync(file, out);
            send(res, 200, JSON.stringify({ ok: true, bytes: out.length }));
          } catch (e) { send(res, 400, JSON.stringify({ ok: false, error: e.message })); }
        }); return;
      }
    }
    // static
    let fp = path.normalize(path.join(ROOT, p === '/' ? 'index.html' : p));
    if (!fp.startsWith(ROOT)) return send(res, 403, 'forbidden', 'text/plain');
    if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
    if (!fs.existsSync(fp)) return send(res, 404, 'not found', 'text/plain');
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(fp).pipe(res);
  } catch (e) { send(res, 500, JSON.stringify({ error: e.message })); }
}).listen(PORT, () => console.log(`site: http://localhost:${PORT}   editor: http://localhost:${PORT}/admin`));
