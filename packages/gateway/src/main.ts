import Koa from 'koa';
import dotenv from 'dotenv';
import http from 'node:http';
import https from 'node:https';
import { logger, stringifyError } from './utils/logger';
import registMiddlewares from './middlewares';
import registRoutes from './routes';
import './data-source';
import getDataSource from './data-source';
import { CertEntity } from './entities/cert';
import { UserEntity } from './entities/user';
import { register } from './services/user';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { setConfig } from './utils/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = new Koa();

dotenv.config({
  path: join(__dirname, '../.env'),
});

const {
  WEB_CLIENT_PORT = '8100',
  WEB_CLIENT_HTTPS_PORT = '8443',
  WEB_CLIENT_HOST = '127.0.0.1',
} = process.env;

registMiddlewares(app);
registRoutes(app);

process.on('uncaughtException', function (err) {
  console.error(err);
  logger.error('Uncaught Exception: ' + stringifyError(err));
});

const httpServer = http.createServer(app.callback());
httpServer.listen(parseInt(WEB_CLIENT_PORT, 10), WEB_CLIENT_HOST);

const appDataSource = await getDataSource();
const certRepository = appDataSource.getRepository(CertEntity);
const userRepository = appDataSource.getRepository(UserEntity);
const entity = await certRepository.findOneBy({ useForWebClient: 1 });

const httpsServer = https.createServer(app.callback());
httpsServer.listen(parseInt(WEB_CLIENT_HTTPS_PORT, 10), WEB_CLIENT_HOST);

if (entity) {
  setConfig('https', 'true');
  setClientSecureContect(entity.key, entity.cert);
}

export function setClientSecureContect(key: Buffer | string, cert: Buffer | string) {
  httpsServer.setSecureContext({ key, cert });
}

logger.info(`web client server is listening on ${WEB_CLIENT_HOST}:${WEB_CLIENT_PORT}`);
logger.info(`https web client server is listening on ${WEB_CLIENT_HOST}:${WEB_CLIENT_HTTPS_PORT}`);

const userCount = await userRepository.count();
if (!userCount) {
  logger.info('no user found, create a temp user: admin');
  await register('admin', 'admin', '', true);
  logger.info('create temp user successfully');
}

if (process.env.NODE_ENV?.includes('dev')) {
  const warnMsg = '[WARNING] You are running server in development mode, which will NOT have user authentication';
  console.warn(warnMsg);
  logger.warn(warnMsg);
}