import koaStatic from 'koa-static';
import Koa from 'koa';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function serveStatic() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    return await koaStatic(join(__dirname, '../../static'))(ctx, next);
  });
}

export { serveStatic };
