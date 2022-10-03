import Router from '@koa/router';
import { getAllConfigs } from '../services/system';
import { resFac } from '../utils/response';

const router = new Router({ prefix: '/system' });

router.post('/get-configs', async (ctx, next) => {
  try {
    const configs = getAllConfigs();
    ctx.body = resFac(0, configs, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

export default router;