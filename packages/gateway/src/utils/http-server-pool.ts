import http from 'node:http';
import https from 'node:https';
import finalhandler from 'finalhandler';
import { createSecureContext, SecureContext } from 'node:tls';
import { getCertByDomain } from './cert';

export interface HttpRequestProcessor {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> | boolean;
}

class HttpServerPool {
  serverMap = new Map<number, http.Server>();
  serverRequestProcessors = new WeakMap<http.Server, HttpRequestProcessor[]>();
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
  getHttpServer(port: number, type?: 'http' | 'https', cert?: Buffer | string, key?: Buffer | string): http.Server | https.Server {
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
      newServer = https.createServer({ SNICallback: this.SNICallback });
    }
    this.serverMap.set(port, newServer);
    newServer.listen(port);
    return newServer;
  }
  deleteHttpProcessor(port: number, processor: HttpRequestProcessor) {
    const server = this.getHttpServer(port);
    const processorList = this.serverRequestProcessors.get(server);
    const idx = processorList?.indexOf(processor);
    if (idx && idx > -1) {
      processorList?.splice(idx, 1);
    }
    if (processorList && processorList.length === 0) {
      server.close();
      this.serverRequestProcessors.delete(server);
      this.serverMap.delete(port);
    }
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