import { WebSocketServer, WebSocket } from 'ws';
import sessionManager, { type Session } from './session';
import { setSafeInterval } from './common';

const wss = new WebSocketServer({ noServer: true });

export async function onUpgrade(req, socket, head) {

  const isLogined = sessionManager.authFn(req);
  if (isLogined) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request, sessionManager.getSessionFromReq(req));
    });
  } else {
    socket.destroy();
  }
}

function heartbeat(this: WebSocket) {
  this.isAlive = true;
}

type WSMessageCallback = (data: string, connectionInfo: ConnectionInfo) => void;

const wss = new WebSocketServer({ port: 8080 });

const interval = setSafeInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      const idx = wsManager.connections.findIndex(c => c.ws === ws);
      wsManager.connections.splice(idx, 1);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

interface ConnectionInfo {
  wss: WebSocketServer;
  ws: WebSocket;
  session: Session;
}

wss.on('connection', (ws, req, session: Session) => {
  const connection: ConnectionInfo = {
    ws,
    session,
    wss,
  };
  wsManager.connections.push(connection);
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('message', function message(data, isBinary) {
    const payload = JSON.parse(data);
    const callbacks = wsManager.callbacks.get(payload.type);
    if (callbacks) {
      callbacks.forEach((cb) => {
        cb(payload.data, connection);
      });
    }
  });
});

class WSManager {
  callbacks = new Map<string, WSMessageCallback[]>()
  connections: ConnectionInfo[] = [];
  emitAll(type: string, data: string) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const data = JSON.stringify({ type, data });
        client.send(data, { binary: false });
      }
    });
  }
  on(type: string, cb: WSMessageCallback) {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      callbacks.push(cb);
    } else {
      this.callbacks.set(type, [cb]);
    }
  }
}

const wsManager = new WSManager();

export default wsManager;
