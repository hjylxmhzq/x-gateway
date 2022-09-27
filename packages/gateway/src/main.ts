import Koa from 'koa';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import registMiddlewares from './middlewares';
import registRoutes from './routes';
import cors from '@koa/cors';

const app = new Koa();

dotenv.config();

if (process.env.NODE_ENV?.includes('dev')) {
  app.use(cors({ credentials: true }));
}

const {
  WEB_CLIENT_PORT = '8100',
  WEB_CLIENT_HOST = '127.0.0.1',
} = process.env;

registMiddlewares(app);
registRoutes(app);
app.use((ctx, next) => {
  console.log(ctx.request.url);
  next();
})

app.listen(WEB_CLIENT_PORT, parseInt(WEB_CLIENT_HOST, 10));

logger.info(`web client server is listening on ${WEB_CLIENT_HOST}:${WEB_CLIENT_PORT}`);