import { bodyParser } from './bodyparser';
import Koa from 'koa';
import { requestLogger } from './logger';
import { serveStatic } from './static';

const registMiddlewares = (app: Koa) => {
  app.use(serveStatic());
  app.use(bodyParser());
  app.use(requestLogger());
}

export default registMiddlewares;