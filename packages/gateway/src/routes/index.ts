import Koa from 'koa';
import userRouter from './user';
import settingRouter from './setting';

const registRoutes = async (app: Koa) => {
  app.use(settingRouter.routes()).use(settingRouter.allowedMethods());
  app.use(userRouter.routes()).use(userRouter.allowedMethods());
}

export default registRoutes;