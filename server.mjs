import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = 443;
const staticDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'static');

const server = http.createServer((req, res) => {
  let filePath = path.join(staticDir, req.url);

  if (filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  const fileStream = fs.createReadStream(filePath);

  fileStream.on('error', (err) => {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      console.error('File Stream Error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  });

  fileStream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
