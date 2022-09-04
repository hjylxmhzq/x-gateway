import Router from '@koa/router';

const router = new Router({ prefix: '/user' });

router.post('login', (ctx, next) => {
  next();
});

export default router;