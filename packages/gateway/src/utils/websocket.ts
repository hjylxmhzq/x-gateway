import { WebSocketServer, WebSocket } from 'ws';
import sessionManager, { type Session } from './session';
import { setSafeInterval } from './common';
import { IncomingMessage } from 'node:http';
import internal from 'node:stream';
import { logger } from './logger';
import requestIp from 'request-ip';

const wss = new WebSocketServer({ noServer: true });

export async function onUpgrade(req: IncomingMessage, socket: internal.Duplex, head: Buffer) {

  const isLogined = await sessionManager.authFn(req);
  if (isLogined && req.url === '/ws-info') {
    wss.handleUpgrade(req, socket, head, function done(ws) {
      wss.emit('connection', ws, req, sessionManager.getSessionFromReq(req));
    });
  } else {
    socket.destroy();
  }
}

function heartbeat(this: WebSocket) {
  const connection = wsManager.connections.find(c => c.ws === this);
  if (!connection) return;
  connection.isAlive = true;
}

type WSMessageCallback = (data: string, connectionInfo: ConnectionInfo) => void;

const interval = setSafeInterval(async () => {
  wss.clients.forEach(function each(ws) {
    const idx = wsManager.connections.findIndex(c => c.ws === ws);
    if (idx === -1) return;
    const connection = wsManager.connections[idx];
    if (connection.isAlive === false) {
      wsManager.connections.splice(idx, 1);
      return ws.terminate();
    }
    connection.isAlive = false;
    ws.ping();
    ws.send(JSON.stringify({ type: 'ping', data: null }));
  });
}, 30000);

interface ConnectionInfo {
  wss: WebSocketServer;
  ws: WebSocket;
  isAlive: boolean;
  session: Session;
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage, session: Session) => {
  const realIp = requestIp.getClientIp(req);
  logger.info(`websocket connect from ${realIp}`);
  const connection: ConnectionInfo = {
    ws,
    session,
    wss,
    isAlive: true,
  };
  wsManager.connections.push(connection);
  ws.on('message', function message(data: string | Buffer, isBinary: boolean) {
    const payload = JSON.parse(data.toString());
    if (payload.type === 'pong') {
      const connection = wsManager.connections.find(c => c.ws === ws);
      if (connection) {
        connection.isAlive = true;
      }
    }
    const callbacks = wsManager.callbacks.get(payload.type);
    if (callbacks) {
      callbacks.forEach((cb) => {
        cb(payload.data, connection);
      });
    }
  });
  ws.on('close', () => {
    const idx = wsManager.connections.findIndex(c => c.ws === ws);
    if (idx === -1) return;
    wsManager.connections.splice(idx, 1);
    console.log(wsManager.connections);
  });
});

class WSManager {
  callbacks = new Map<string, WSMessageCallback[]>()
  connections: ConnectionInfo[] = [];
  emitAll(type: string, data: string) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const wrappedData = JSON.stringify({ type, data });
        client.send(wrappedData, { binary: false });
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
