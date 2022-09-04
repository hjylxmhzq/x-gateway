import { bodyParser } from './bodyparser';
import Koa from 'koa';

const registMiddlewares = (app: Koa) => {
  app.use(bodyParser());
}

export default registMiddlewares;