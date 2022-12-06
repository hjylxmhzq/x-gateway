import koaStatic from 'koa-static';
import Koa from 'koa';
import send from 'koa-send';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const staticDir = join(__dirname, '../../static');
const serve = koaStatic(staticDir, { maxAge: 3600 * 1000, gzip: true });
const ignoreCachePattern = /\.html$/;

function serveStatic() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx.path === '/' || ignoreCachePattern.test(ctx.path)) {
      return await send(ctx, ctx.path, { root: staticDir, index: 'index.html', maxAge: 0 });
    }
    return await serve(ctx, next);
  });
}

export { serveStatic };
