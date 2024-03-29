import http from 'node:http';
import https from 'node:https';
import http2 from 'node:http2';
import finalhandler from 'finalhandler';
import { createSecureContext, SecureContext } from 'node:tls';
import { getCertByDomain } from './cert';
import internal from 'node:stream';

export interface HttpRequestProcessor {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> | boolean;
}

export interface HttpUpgradeProcessor {
  (req: http.IncomingMessage, socket: internal.Duplex, head: Buffer): Promise<boolean> | boolean;
}

class HttpServerPool {
  serverMap = new Map<number, http.Server | http2.Http2SecureServer>();
  serverRequestProcessors = new WeakMap<http.Server | http2.Http2SecureServer, HttpRequestProcessor[]>();
  serverUpgradeProcessors = new WeakMap<http.Server | http2.Http2SecureServer, HttpUpgradeProcessor[]>();
  constructor() {

  }
  async SNICallback(hostname: string, cb: (err: Error | null, ctx?: SecureContext) => void) {
    const cert = await getCertByDomain(hostname, true);
    if (cert) {
      cb(null, createSecureContext({ cert: cert.cert, key: cert.key }));
      return;
    }
    cb(new Error('cannot find proper secure context'));
  }
  getHttpServer(port: number, type?: 'http' | 'https', cert?: Buffer | string, key?: Buffer | string): http.Server | https.Server | http2.Http2SecureServer {
    const server = this.serverMap.get(port);
    if ((type === 'http' && server instanceof https.Server)
      || (type === 'https' && server instanceof http.Server)) {
      throw new Error(`port ${port} is already listening as ${type} server`);
    }
    if (server) {
      return server;
    }
    let newServer;
    if (type === 'http') {
      newServer = http.createServer();
    } else {
      newServer = http2.createSecureServer({ SNICallback: this.SNICallback, allowHTTP1: true });
    }
    this.serverMap.set(port, newServer);
    newServer.listen(port);
    return newServer;
  }
  deleteHttpProcessor(port: number, processor: HttpRequestProcessor) {
    const server = this.getHttpServer(port);
    const processorList = this.serverRequestProcessors.get(server);
    const idx = processorList?.indexOf(processor);
    if (idx === -1 || idx === undefined) {
      throw new Error(`can not find server listening on port ${port}`);
    }
    processorList?.splice(idx, 1);
    if (!processorList?.length) {
      this.deleteAllUpgradeProcessor(port);
      server.close();
      this.serverRequestProcessors.delete(server);
      this.serverMap.delete(port);
    }
  }
  deleteAllUpgradeProcessor(port: number) {
    const server = this.getHttpServer(port);
    const processorList = this.serverUpgradeProcessors.get(server);
    if (processorList) {
      processorList.length = 0;
    }
  }
  deleteUpgradeProcessor(port: number, processor: HttpUpgradeProcessor) {
    const server = this.getHttpServer(port);
    const processorList = this.serverUpgradeProcessors.get(server);
    const idx = processorList?.indexOf(processor);
    if (idx === -1 || idx === undefined) {
      throw new Error(`can not find server listening on port ${port}`);
    }
    processorList?.splice(idx, 1);
  }
  setHttpUpgradeProcessor(port: number, processor: HttpUpgradeProcessor) {
    const server = this.getHttpServer(port);
    if (!server) {
      throw new Error(`no server listening on port ${port}`);
    }
    const processorList = this.serverUpgradeProcessors.get(server);
    if (processorList) {
      processorList.push(processor);
      return;
    }
    const newProcessorList: HttpUpgradeProcessor[] = [processor];
    this.serverUpgradeProcessors.set(server, newProcessorList);
    server.on('upgrade', async (req, socket, head) => {
      let isProcessed = false;
      for (let processor of newProcessorList) {
        isProcessed = await processor(req, socket, head);
        if (isProcessed) {
          break;
        }
      }
    });
  }
  setHttpServerProcessor(
    port: number, processor: HttpRequestProcessor, firstOrder = false,
    options: { type: 'http' | 'https', cert?: string | Buffer, key?: string | Buffer } = { type: 'http' }
  ) {
    const server = options.type === 'http' ? this.getHttpServer(port, 'http') : this.getHttpServer(port, 'https', options.cert, options.key);
    const processorList = this.serverRequestProcessors.get(server);
    if (processorList) {
      if (firstOrder) {
        processorList.unshift(processor);
      } else {
        processorList.push(processor);
      }
      return;
    }
    const newProcessorList: HttpRequestProcessor[] = [processor];
    this.serverRequestProcessors.set(server, newProcessorList);
    server.on('request', async (req, res) => {
      let isProcessed = false;
      for (let processor of newProcessorList) {
        isProcessed = await processor(req, res);
        if (isProcessed) {
          break;
        }
      }
      if (!isProcessed) {
        const done = finalhandler(req, res);
        done();
      }
    });
  }
}

export const httpServerPool = new HttpServerPool();