import Router from '@koa/router';
import { AddProxyRequest, AddProxyResponse, ProxyStatus } from '@x-gateway/interface'

const router = new Router({ prefix: '/setting' });

router.post('/add-proxy', async (ctx, next) => {
  const body = ctx.request.body as AddProxyRequest;
  ctx.body = { ...body, status: ProxyStatus.stopped } as AddProxyResponse;
  await next();
});

export default router;