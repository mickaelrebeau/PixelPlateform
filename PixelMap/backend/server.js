const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const pixels = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');
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

console.log('WebSocket server started on port 8080');
