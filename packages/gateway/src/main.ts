import Koa from 'koa';
import dotenv from 'dotenv';
import http from 'node:http';
import https from 'node:https';
import { logger, stringifyError } from './utils/logger';
import registMiddlewares from './middlewares';
import registRoutes from './routes';
import cors from '@koa/cors';
import fs from 'fs-extra';
import './data-source';
import getDataSource from './data-source';
import { CertEntity } from './entities/cert';

const app = new Koa();

dotenv.config();

if (process.env.NODE_ENV?.includes('dev')) {
  app.use(cors({ credentials: true }));
}

const {
  WEB_CLIENT_PORT = '8100',
  WEB_CLIENT_HTTPS_PORT = '8443',
  WEB_CLIENT_HOST = '127.0.0.1',
} = process.env;

registMiddlewares(app);
registRoutes(app);
app.use((ctx, next) => {
  console.log(ctx.request.url);
  next();
})

process.on('uncaughtException', function (err) {
  console.error(err);
  logger.error('Uncaught Exception: ' + stringifyError(err));
});

const httpServer = http.createServer(app.callback());
httpServer.listen(parseInt(WEB_CLIENT_PORT, 10), WEB_CLIENT_HOST);

const appDataSource = await getDataSource();
const certRepository = appDataSource.getRepository(CertEntity);
const entity = await certRepository.findOneBy({ useForWebClient: 1 });

const httpsServer = https.createServer(app.callback());
httpsServer.listen(parseInt(WEB_CLIENT_HTTPS_PORT, 10), WEB_CLIENT_HOST);

if (entity) {
  setClientSecureContect(entity.key, entity.cert);
}

export function setClientSecureContect(key: Buffer | string, cert: Buffer | string) {
  httpsServer.setSecureContext({ key, cert });
}

logger.info(`web client server is listening on ${WEB_CLIENT_HOST}:${WEB_CLIENT_PORT}`);
logger.info(`https web client server is listening on ${WEB_CLIENT_HOST}:${WEB_CLIENT_HTTPS_PORT}`);
