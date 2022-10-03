import Koa from 'koa';
import cors from '@koa/cors';

function corsMW() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    return cors({ credentials: true })(ctx, next);
  });
}

export { corsMW };
