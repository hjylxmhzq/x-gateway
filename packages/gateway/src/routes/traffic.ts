import Router from '@koa/router';
import { GetProxyTrafficRequest, GetProxyTrafficRequestValidator } from '@x-gateway/interface/lib';
import { getAllProxiesInfoInTraffic, getProxyInfoByName } from '../services/traffic';
import { resFac } from '../utils/response';

const router = new Router({ prefix: '/traffic' });

router.post('/get-all-proxies', async (ctx, next) => {
  try {
    const traffic = await getAllProxiesInfoInTraffic();
    ctx.body = resFac(0, traffic, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

router.post('/get-proxy-traffic', async (ctx, next) => {
  const body = ctx.request.body as GetProxyTrafficRequest;
  try {
    await GetProxyTrafficRequestValidator.validateAsync(body);
    const traffics = await getProxyInfoByName(body.name);
    ctx.body = resFac(0, traffics, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

export default router;