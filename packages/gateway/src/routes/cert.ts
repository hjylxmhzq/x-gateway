import Router from '@koa/router';
import { createCert, deleteCert, disableCertForWebClient, getAllCerts, getRunningProcess, reCreateCert, setCertForWebClient } from '../services/cert';
import { resFac } from '../utils/response';
import { RecreateCertRequest, RecreateCertRequestValidator, RequestNewCertRequestValidator, SetCertForWebClientRequestValidator, SetCertForWebClientRequest, RequestNewCertRequest, DeleteCertRequest, DeleteCertRequestValidator } from '@x-gateway/interface';

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
    createCert(body.name, body.domain, ctx.session.username);
    const running = getRunningProcess();
    ctx.body = resFac(0, running, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

router.post('/recreate-cert', async (ctx, next) => {
  const body = ctx.request.body as RecreateCertRequest;
  try {
    await RecreateCertRequestValidator.validateAsync(body);
    reCreateCert(body.name, ctx.session.username);
    const running = getRunningProcess();
    ctx.body = resFac(0, running, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

router.post('/delete-cert', async (ctx, next) => {
  const body = ctx.request.body as DeleteCertRequest;
  try {
    await DeleteCertRequestValidator.validateAsync(body);
    const success = await deleteCert(body.name);
    if (success) {
      ctx.body = resFac(0, {}, 'success');
    } else {
      ctx.body = resFac(1, {}, 'delete certification error');
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

router.post('/set-cert-for-webclient', async (ctx, next) => {
  const body = ctx.request.body as SetCertForWebClientRequest;
  try {
    await SetCertForWebClientRequestValidator.validateAsync(body);
    await setCertForWebClient(body.name);
    const certs = await getAllCerts();
    ctx.body = resFac(0, certs, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

router.post('/disable-cert-for-webclient', async (ctx, next) => {
  const body = ctx.request.body as SetCertForWebClientRequest;
  try {
    await SetCertForWebClientRequestValidator.validateAsync(body);
    await disableCertForWebClient(body.name);
    const certs = await getAllCerts();
    ctx.body = resFac(0, certs, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }

  await next();
});

export default router;