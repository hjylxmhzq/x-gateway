import { IncomingMessage } from "http";
import serveStatic from 'serve-static';
import getDataSource from "../data-source";
import { CertEntity } from "../entities/cert";
import { ProxyEntity } from "../entities/proxy";
import { StaticServerEntity } from "../entities/static-server";
import { HttpRequestProcessor, httpServerPool } from "./http-server-pool";
import sessionManager, { redirectToLogin } from "./session";

interface BaseStaticServerOption {
  name: string,
  port: number,
  host: string,
  root: string,
  protocol: 'http' | 'https',
  maxAge: number,
  etag: boolean,
  index: string[],
  extensions: string[],
  needAuth: boolean,
  certName?: string;
  authFn: (req: IncomingMessage) => Promise<boolean> | boolean;
}

type StaticServerOption = BaseStaticServerOption;

export enum StaticServerStatus {
  running = 'running',
  stopped = 'stopped',
};

class StaticServer {
  status: StaticServerStatus = StaticServerStatus.stopped;
  traffic: { sent: number; received: number } = { sent: 0, received: 0 };
  isDestroyed = false;
  requestCount = 0;
  processor: HttpRequestProcessor;
  constructor(public option: StaticServerOption & { cert?: CertEntity | null }) {
    const processor: HttpRequestProcessor = async (req, res) => {
      if (this.status !== StaticServerStatus.running) {
        return false;
      }
      const reqPath = req.url;
      if (req.headers.host && reqPath) {
        const [hostname] = req.headers.host.split(':');
        if (!hostname || hostname !== option.host) {
          return false;
        }
        const isAuthed = (option.needAuth ? await option.authFn(req) : true);
        if (isAuthed) {
          this.requestCount++;
          const serve = serveStatic('public/ftp', {
            index: false,
            etag: option.etag,
            extensions: option.extensions,
            maxAge: option.maxAge,
          });
          serve(req, res, () => undefined);
          return true;
        } else {
          const [path, querystring] = req.url?.split('?') || ['', ''];
          const redirectUrl = redirectToLogin(option.protocol, req.headers.host, path, querystring);
          res.statusCode = 302;
          res.setHeader('location', redirectUrl);
          res.end();
          return true;
        }
      }
      return false;
    }
    httpServerPool.setHttpServerProcessor(option.port, processor, false, { type: option.protocol, ...this.option.cert });
    this.processor = processor;
  }
  start() {
    this.status = StaticServerStatus.running;
  }
  stop() {
    this.status = StaticServerStatus.stopped;
  }
  destroy() {
    this.isDestroyed = true;
    httpServerPool.deleteHttpProcessor(this.option.port, this.processor);
  }
}

const appDataSource = await getDataSource();
const staticServerRepository = appDataSource.getRepository(StaticServerEntity);
const certRepository = appDataSource.getRepository(CertEntity);

class StaticServerManager {
  servers: StaticServer[] = [];
  async addStaticServer(
    options: StaticServerOption
  ) {
    const {
      name,
      port,
      host,
      root,
      index,
      protocol = 'http',
      maxAge = 3600 * 1000,
      etag = false,
      extensions = [],
      certName,
      needAuth,
    } = options;
    if (this.servers.find(p => p.option.name === name)) {
      return undefined;
    }
    let server;
    let certEntity: CertEntity | undefined;
    if (protocol === 'https') {
      certEntity = (await certRepository.findOneBy({ name: certName })) || undefined;
      if (!certEntity) {
        throw new Error(`can not find cert with name ${certName}`);
      }
      server = new StaticServer({ ...options, cert: certEntity });
    } else {
      server = new StaticServer(options);
    }
    await server.start();
    this.servers.push(server);

    const entity = new StaticServerEntity();
    entity.name = name;
    entity.host = host;
    entity.port = port;
    entity.root = root;
    if (certEntity) {
      entity.cert = certEntity;
    }
    entity.etag = etag;
    entity.extensions = extensions.join(',');
    entity.index = index.join(',');
    entity.trafficReceived = 0;
    entity.trafficSent = 0;
    entity.status = true;
    entity.needAuth = needAuth;
    staticServerRepository.save(entity);

    return server;
  }
  async deleteServer(name: string) {
    await staticServerRepository.delete(name);
    const idx = this.servers.findIndex(p => p.option.name === name)
    if (idx !== -1) {
      this.servers[idx].destroy();
      this.servers.splice(idx, 1);
      return true;
    }
    return false;
  }
  async stopServer(name: string) {
    const proxies = this.listAllProxies();
    const proxy = proxies.find(p => p.option.name === name);
    if (proxy) {
      proxy.stop();
      const staticServerEntity = await staticServerRepository.findOneBy({ name });
      if (staticServerEntity) {
        staticServerEntity.status = false;
        await staticServerRepository.save(staticServerEntity);
      }
      return proxy;
    }
  }
  async startProxy(name: string) {
    const proxies = this.listAllProxies();
    const proxy = proxies.find(p => p.option.name === name);
    if (proxy) {
      proxy.start();
      const staticServerEntity = await staticServerRepository.findOneBy({ name });
      if (staticServerEntity) {
        staticServerEntity.status = true;
        await staticServerRepository.save(staticServerEntity);
      }
      return proxy;
    }
  }
  listAllProxies() {
    return this.servers;
  }
  async restoreProxiesFromDataBase() {
    const entities = await staticServerRepository.find();
    for (let entity of entities) {
      const { name, port, host, root, etag, maxAge, status, protocol, cert, index, extensions, needAuth } = entity;
      const proxy = new StaticServer({
        name,
        port,
        host,
        root,
        protocol,
        etag,
        maxAge,
        authFn: sessionManager.authFn,
        cert,
        index: index.split(','),
        extensions: extensions.split(','),
        needAuth
      });
      this.servers.push(proxy);
      proxy.traffic.sent = entity.trafficSent;
      proxy.traffic.received = entity.trafficReceived;
      if (!status) {
        proxy.stop();
      }
    }
  }
}

export const staticServerManager = new StaticServerManager();

export default staticServerManager;
