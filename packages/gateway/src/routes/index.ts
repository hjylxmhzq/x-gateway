import Koa from 'koa';
import userRouter from './user';
import settingRouter from './setting';
import logRouter from './log';
import certRouter from './cert';
import trafficRouter from './traffic';
import systemRouter from './system';

const registRoutes = async (app: Koa) => {
  app.use(settingRouter.routes()).use(settingRouter.allowedMethods());
  app.use(userRouter.routes()).use(userRouter.allowedMethods());
  app.use(logRouter.routes()).use(logRouter.allowedMethods());
  app.use(certRouter.routes()).use(certRouter.allowedMethods());
  app.use(trafficRouter.routes()).use(trafficRouter.allowedMethods());
  app.use(systemRouter.routes()).use(systemRouter.allowedMethods());
}

export default registRoutes;