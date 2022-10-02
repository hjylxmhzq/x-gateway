import Router from '@koa/router';
import { createCert, getAllCerts, getRunningProcess } from '../services/cert';
import { resFac } from '../utils/response';
import { RequestNewCertRequestValidator, RequestNewCertResponse, RequestNewCertRequest } from '@x-gateway/interface';

const router = new Router({ prefix: '/cert' });

router.post('/get-all-certs', async (ctx, next) => {
  const certs = await getAllCerts();
  ctx.body = resFac(0, certs, 'success');
  next();
});

router.post('/get-deployed-certs', async (ctx, next) => {
  const certs = await getAllCerts();
  ctx.body = resFac(0, certs, 'success');
  next();
});

router.post('/get-running-certs', async (ctx, next) => {
  const certs = await getRunningProcess();
  ctx.body = resFac(0, certs, 'success');
  next();
});

router.post('/request-new-cert', async (ctx, next) => {
  const body = ctx.request.body as RequestNewCertRequest;
  try {
    await RequestNewCertRequestValidator.validateAsync(body);
    createCert(body.name, body.domain, 'temp_user');
    const running = getRunningProcess();
    ctx.body = resFac(0, running, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

export default router;