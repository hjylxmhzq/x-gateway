import { bodyParser } from './bodyparser';
import Koa from 'koa';
import { requestLogger } from './logger';
import { serveStatic } from './static';
import { urlRewrite } from './url-rewrite';
import { session } from './session';
import { userGuard } from './user-guard';
import { corsMW } from './cors';

const registMiddlewares = (app: Koa) => {
  app.use(corsMW());
  app.use(session());
  app.use(userGuard());
  app.use(urlRewrite());
  app.use(serveStatic());
  app.use(bodyParser());
  app.use(requestLogger());
}

export default registMiddlewares;