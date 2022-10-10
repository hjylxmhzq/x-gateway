import http, { IncomingMessage } from 'node:http';
import https from 'node:https';
import internal from 'node:stream';
import httpProxy from 'http-proxy';
import { ProxyEntity } from '../entities/proxy';
import getDataSource from '../data-source';
import sessionManager, { redirectToLogin } from './session';
import { CertEntity } from '../entities/cert';
import { HttpRequestProcessor, httpServerPool } from './http-server-pool';

export type ProxyType = 'http' | 'https';

export enum ProxyStatus {
  running = 'running',
  starting = 'starting',
  stoppping = 'stopping',
  stopped = 'stopped',
}

class TunnelProxy {
  constructor(public type: ProxyType) { }
}


interface HttpConnectProcessor {
  (req: http.IncomingMessage, socket: internal.Duplex, head: Buffer): void;
}

const appDataSource = await getDataSource();
const proxyRepository = appDataSource.getRepository(ProxyEntity);
const certRepository = appDataSource.getRepository(CertEntity);

export class HttpProxy extends TunnelProxy {
  status: ProxyStatus = ProxyStatus.stopped;
  traffic: { sent: number; received: number } = { sent: 0, received: 0 };
  isDestroyed = false;
  requestCount = 0;
  needAuth = false;
  proxy = httpProxy.createProxyServer({});
  secureContext = {
    key: '',
    cert: '',
  } as { key: string | Buffer; cert: string | Buffer };
  processor: HttpRequestProcessor;
  constructor(
    public name: string,
    public port: number,
    public host: RegExp,
    public path: RegExp,
    public targetHost: string,
    public targetPort: number,
    public authFn: (req: http.IncomingMessage) => Promise<boolean> | boolean = () => true,
    public options: { type: 'http' | 'https', cert?: string | Buffer, key?: string | Buffer } = { type: 'http' }
  ) {
    super(options.type);
    this.proxy.on('proxyRes', (proxyRes) => {
      proxyRes.on('data', (chunk) => {
        this.traffic.received += chunk.length;
      });
    });
    const processor: HttpRequestProcessor = async (req, res) => {
      if (this.status !== ProxyStatus.running) {
        return false;
      }
      const reqPath = req.url;
      if (req.headers.host && reqPath) {
        const [hostname] = req.headers.host.split(':');
        if (!hostname || !host.test(hostname) || !path.test(reqPath)) {
          return false;
        }
        const isAuthed = (this.needAuth ? await authFn(req) : true);
        if (isAuthed) {
          this.requestCount++;
          this.proxy.web(req, res, { target: `http://${targetHost}:${targetPort}` });
          req.on('data', (chunk) => {
            this.traffic.sent += chunk.length;
          });
          return true;
        } else {
          const [path, querystring] = req.url?.split('?') || ['', ''];
          const redirectUrl = redirectToLogin(options.type, req.headers.host, path, querystring);
          res.statusCode = 302;
          res.setHeader('location', redirectUrl);
          res.end();
          return true;
        }
      }
      return false;
    }
    if (options.type === 'https' && options.cert && options.key) {
      this.secureContext.key = options.key;
      this.secureContext.cert = options.cert;
    }
    httpServerPool.setHttpServerProcessor(port, processor, false, options);
    this.processor = processor;
  }
  async start() {
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
    httpServerPool.deleteHttpProcessor(this.port, this.processor);
  }
  toJSON() {
    return {
      ...this,
      proxy: {},
      secureContext: {},
      options: {},
      host: this.host.source,
      path: this.path.source,
    };
  }
}

class ProxyManager {
  httpProxies: HttpProxy[] = [];
  constructor() {
  }
  async addHttpProxy(
    name: string,
    port: number,
    host: RegExp,
    path: RegExp,
    targetHost: string,
    targetPort: number,
    type: 'http' | 'https' = 'http',
    certName?: string,
    needAuth: boolean = false,
  ) {
    if (this.httpProxies.find(p => p.name === name)) {
      return undefined;
    }
    let proxy;
    if (type === 'https') {
      const certEntity = await certRepository.findOneBy({ name: certName });
      const { cert, key } = certEntity || {};
      proxy = new HttpProxy(name, port, host, path, targetHost, targetPort,
        sessionManager.authFn,
        {
          type: 'https',
          cert,
          key,
        }
      );
    } else {
      proxy = new HttpProxy(name, port, host, path, targetHost, targetPort, sessionManager.authFn);
    }
    proxy.needAuth = needAuth;
    await proxy.start();
    this.httpProxies.push(proxy);

    const entity = new ProxyEntity();
    entity.name = name;
    entity.host = host.source;
    entity.port = port;
    entity.type = type;
    entity.certName = certName || '';
    entity.path = path.source;
    entity.targetHost = targetHost;
    entity.targetPort = targetPort;
    entity.trafficReceived = 0;
    entity.trafficSent = 0;
    entity.status = 1;
    entity.needAuth = needAuth;
    proxyRepository.save(entity);

    return proxy;
  }
  async deleteProxy(name: string) {
    const appDataSource = await getDataSource();
    const proxyRepository = appDataSource.getRepository(ProxyEntity);
    await proxyRepository.delete(name);
    const idx = this.httpProxies.findIndex(p => p.name === name)
    if (idx !== -1) {
      this.httpProxies[idx].destroy();
      this.httpProxies.splice(idx, 1);
      return true;
    }
    return false;
  }
  async stopProxy(name: string) {
    const appDataSource = await getDataSource();
    const proxyRepository = appDataSource.getRepository(ProxyEntity);
    const proxies = this.listAllProxies();
    const proxy = proxies.find(p => p.name === name);
    if (proxy) {
      proxy.stop();
      const proxyEntity = await proxyRepository.findOneBy({ name });
      if (proxyEntity) {
        proxyEntity.status = 0;
        await proxyRepository.save(proxyEntity);
      }
      return proxy;
    }
  }
  async startProxy(name: string) {
    const appDataSource = await getDataSource();
    const proxyRepository = appDataSource.getRepository(ProxyEntity);
    const proxies = this.listAllProxies();
    const proxy = proxies.find(p => p.name === name);
    if (proxy) {
      proxy.start();
      const proxyEntity = await proxyRepository.findOneBy({ name });
      if (proxyEntity) {
        proxyEntity.status = 1;
        await proxyRepository.save(proxyEntity);
      }
      return proxy;
    }
  }
  listAllProxies() {
    const proxies = [...this.httpProxies];
    return proxies;
  }
  async restoreProxiesFromDataBase() {
    const appDataSource = await getDataSource();
    const proxyRepository = appDataSource.getRepository(ProxyEntity);
    const entities = await proxyRepository.find();
    for (let entity of entities) {
      const { name, port, host, path, targetHost, targetPort, status, type, certName } = entity;
      let cert;
      let key;
      if (type === 'https') {
        const certEntity = await certRepository.findOneBy({ name: certName });
        if (certEntity) {
          ({ cert, key } = certEntity);
        }
      }
      const proxy = new HttpProxy(name, port, new RegExp(host), new RegExp(path), targetHost, targetPort, sessionManager.authFn, {
        type: entity.type as 'http' | 'https',
        cert,
        key,
      });
      proxy.needAuth = entity.needAuth;
      this.httpProxies.push(proxy);
      proxy.traffic.sent = entity.trafficSent;
      proxy.traffic.received = entity.trafficReceived;
      if (!status) {
        proxy.stop();
      }
    }
  }
}

const proxyManager = new ProxyManager();
proxyManager.restoreProxiesFromDataBase();

export {
  proxyManager,
}
