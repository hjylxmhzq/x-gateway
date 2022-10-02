import { bodyParser } from './bodyparser';
import Koa from 'koa';
import { requestLogger } from './logger';

const registMiddlewares = (app: Koa) => {
  app.use(bodyParser());
  app.use(requestLogger());
}

export default registMiddlewares;