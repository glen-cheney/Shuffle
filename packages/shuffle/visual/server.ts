// oxlint-disable import/no-nodejs-modules server file.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
const dist = path.join(root, '..', 'dist');

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let file;
    if (url.pathname.startsWith('/dist/')) {
      file = path.join(dist, url.pathname.slice('/dist/'.length));
    } else {
      const name = url.pathname === '/' ? '/grid.html' : url.pathname;
      file = path.join(root, name);
    }
    const body = readFileSync(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(20_023, '127.0.0.1', () => {
  // oxlint-disable-next-line no-console
  console.log('visual server on 20023');
});
