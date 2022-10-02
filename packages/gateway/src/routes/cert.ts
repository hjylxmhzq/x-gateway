import Router from '@koa/router';
import { getAllCerts } from '../services/cert';
import { resFac } from '../utils/response';

const router = new Router({ prefix: '/cert' });

router.post('/get-all-certs', async (ctx, next) => {
  const certs = await getAllCerts();
  ctx.body = resFac(0, certs, 'success');
  next();
});

router.post('/get-all-certs', async (ctx, next) => {
  const certs = await getAllCerts();
  ctx.body = resFac(0, certs, 'success');
  next();
});

export default router;