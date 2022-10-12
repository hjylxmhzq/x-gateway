let ws: WebSocket;
let openPromise: Promise<WebSocket>;

export async function getWebSocket() {
  if (ws && ws.readyState === ws.OPEN) {
    return ws;
  }
  if (ws && ws.readyState === ws.CONNECTING) {
    return openPromise;
  }
  const host = process.env.NODE_ENV === 'development' ? 'localhost:8100' : window.location.host;
  const wsUrl = window.location.protocol === 'http:' ? `ws://${host}/ws-info` : `wss://${host}/ws-info`;
  ws = new WebSocket(wsUrl);
  openPromise = new Promise((resolve) => {
    ws.addEventListener('open', () => {
      ws.addEventListener('message', (ev) => {
        const payload = JSON.parse(ev.data);
        if (payload.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', data: null }));
        }
      });
      resolve(ws);
    });
  });
  return openPromise;
}

(window as any).getWS = getWebSocket;