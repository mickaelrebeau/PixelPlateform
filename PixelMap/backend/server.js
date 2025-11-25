const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200);
    res.end('OK');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocket.Server({ server });

const pixels = new Map();

wss.on('connection', (ws, req) => {
  console.log('Client connected from:', req.headers.origin);

  const initialState = Array.from(pixels.entries()).map(([key, value]) => {
    const [x, y] = key.split(',').map(Number);
    return { x, y, ...value };
  });
  ws.send(JSON.stringify({ type: 'INIT', data: initialState }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'DRAW') {
        const { x, y, color, owner } = data;
        const key = `${x},${y}`;
        const now = Date.now();

        if (pixels.has(key)) {
          const currentPixel = pixels.get(key);
          if (now - currentPixel.timestamp < 300000) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              message: 'Pixel is on cooldown'
            }));
            return;
          }
        }

        const pixelData = { color, timestamp: now, owner };
        pixels.set(key, pixelData);

        const updateMsg = JSON.stringify({ type: 'UPDATE', data: { x, y, ...pixelData } });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(updateMsg);
          }
        });
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
