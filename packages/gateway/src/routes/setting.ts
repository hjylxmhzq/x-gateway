import Router from '@koa/router';
import { AddHttpProxyRequest, AddHttpProxyResponse, AddHttpRequestValidator, ProxyProtocol, ProxyStatus, DeleteProxyRequest, DeleteProxyRequestValidator, ListProxyRequest, ListProxyRequestValidator } from '@x-gateway/interface'
import { proxyManager } from '../utils/proxy-manager';
import { resFac } from '../utils/response';

const router = new Router({ prefix: '/setting' });

router.post('/add-proxy', async (ctx, next) => {
  const body = ctx.request.body as AddHttpProxyRequest;
  try {
    await AddHttpRequestValidator.validateAsync(body);
    if (body.proxyProtocol === ProxyProtocol.http) {
      const proxy = proxyManager.addHttpProxy(body.name, body.port, new RegExp(body.host), new RegExp(body.path), body.proxyHost, body.proxyPort);
      if (proxy) {
        ctx.body = resFac(0, {}, 'ok');
      } else {
        ctx.body = resFac(1, {}, `A proxy with name [${body.name}] is already existed`);
      }
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/delete-proxy', async (ctx, next) => {
  const body = ctx.request.body as DeleteProxyRequest;
  try {
    await DeleteProxyRequestValidator.validateAsync(body);
    const success = proxyManager.deleteProxy(body.name);
    if (success) {
      ctx.body = resFac(0, {}, 'ok');
    } else {
      ctx.body = resFac(1, {}, `can not find a proxy with name [${body.name}]`);
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/list-proxy', async (ctx, next) => {
  const body = ctx.request.body as ListProxyRequest;
  try {
    await ListProxyRequestValidator.validateAsync(body);
    const proxies = proxyManager.listAllProxies();
    ctx.body = resFac(0, proxies, 'ok');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});
export default router;