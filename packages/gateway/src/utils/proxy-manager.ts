import http from 'node:http';
import internal from 'node:stream';
import httpProxy from 'http-proxy';


export enum ProxyType {
  http = 'http',
}

export enum ProxyStatus {
  running = 'running',
  starting = 'starting',
  stoppping = 'stopping',
  stopped = 'stopped',
}

class TunnelProxy {
  constructor(public type: ProxyType) { }
}

interface HttpRequestProcessor {
  (req: http.IncomingMessage, res: http.ServerResponse): void;
}

interface HttpConnectProcessor {
  (req: http.IncomingMessage, socket: internal.Duplex, head: Buffer): void;
}

const httpServerMap = new Map<number, http.Server>();
const serverProcessors = new Map<http.Server, Set<HttpProxy>>();
var proxy = httpProxy.createProxyServer({});

class HttpProxy extends TunnelProxy {
  server: http.Server;
  status: ProxyStatus = ProxyStatus.stopped;
  isDestroyed = false;
  processor: HttpRequestProcessor;
  constructor(
    public name: string,
    public port: number,
    public host: RegExp,
    public path: RegExp,
    public targetHost: string,
    public targetPort: number,
    public authFn: (req: http.IncomingMessage) => Promise<boolean> | boolean = () => true
  ) {
    super(ProxyType.http);
    const currentServer = httpServerMap.get(port)
    if (currentServer) {
      this.server = currentServer;
    } else {
      this.server = http.createServer();
      httpServerMap.set(port, this.server);
      this.server.listen(port);
    }
    const currentProxies = serverProcessors.get(this.server);
    if (currentProxies) {
      currentProxies.add(this);
    } else {
      serverProcessors.set(this.server, new Set([this]));
    }
    const processor: HttpRequestProcessor = async (req, res) => {
      if (this.status !== ProxyStatus.running) {
        res.statusCode = 404;
        res.end('Not Found');
      }
      const reqPath = req.url;
      if (req.headers.host && reqPath) {
        const [hostname] = req.headers.host.split(':');
        if (!hostname || !host.test(hostname) || !path.test(reqPath)) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        const isAuthed = await authFn(req);
        if (isAuthed) {
          proxy.web(req, res, { target: `http://${targetHost}:${targetPort}` });
        } else {
          res.statusCode = 401;
          res.end('Unauthorized');
        }
      }
      console.log(req.headers.host);
    }
    this.addProcessor(processor)
    this.processor = processor;
    this.start();
  }
  addProcessor(processor: HttpRequestProcessor) {
    this.server.on('request', processor);
  }
  removeProcessor(processor: HttpRequestProcessor) {
    this.server.off('request', processor);
  }
  start() {
    if (this.isDestroyed) {
      console.error('destroyed proxy can not be started');
      return;
    }
    this.status = ProxyStatus.running;
  }
  stop() {
    this.status = ProxyStatus.stopped;
  }
  destroy() {
    this.isDestroyed = true;
    this.removeProcessor(this.processor);
    const processors = serverProcessors.get(this.server);
    if (processors) {
      processors.delete(this);
      if (processors.size === 0) {
        this.server.close();
        this.server.unref();
        httpServerMap.delete(this.port);
      }
    }
  }
  toJSON() {
    return {
      ...this,
      host: this.host.source,
      path: this.path.source,
    };
  }
}

class ProxyManager {
  httpProxies: HttpProxy[] = [];
  constructor() {
  }
  addHttpProxy(name: string, port: number, host: RegExp, path: RegExp, targetHost: string, targetPort: number) {
    if (this.httpProxies.find(p => p.name === name)) {
      return undefined;
    }
    const proxy = new HttpProxy(name, port, host, path, targetHost, targetPort);
    this.httpProxies.push(proxy);
    return proxy;
  }
  deleteProxy(name: string) {
    const idx = this.httpProxies.findIndex(p => p.name === name)
    if (idx !== -1) {
      this.httpProxies[idx].destroy();
      this.httpProxies.splice(idx, 1);
      return true;
    }
    return false;
  }
  listAllProxies() {
    const proxies = [...this.httpProxies];
    return proxies;
  }
}

const proxyManager = new ProxyManager();

export {
  proxyManager,
}