import Koa from 'koa';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import registMiddlewares from './middlewares';
import registRoutes from './routes';
const app = new Koa();

dotenv.config();

const {
  WEB_CLIENT_PORT = '8100',
  WEB_CLIENT_HOST = '127.0.0.1',
} = process.env;

registMiddlewares(app);
registRoutes(app);
app.use(() => {
  console.log(12323)
})

app.listen(WEB_CLIENT_PORT, parseInt(WEB_CLIENT_HOST, 10));

logger.info(`web client server is listening on ${WEB_CLIENT_HOST}:${WEB_CLIENT_PORT}`);