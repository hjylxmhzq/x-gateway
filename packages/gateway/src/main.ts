import Koa from 'koa';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import registRouters from './routes';
import routes from './routes';
const app = new Koa();

dotenv.config();

const {
  WEB_CLIENT_PORT = '8100',
  WEB_CLIENT_HOST = '127.0.0.1',
} = process.env;

app.use(routes());

app.listen(WEB_CLIENT_PORT, parseInt(WEB_CLIENT_HOST, 10));

logger.info(`web client server is listening on ${WEB_CLIENT_HOST}:${WEB_CLIENT_PORT}`);