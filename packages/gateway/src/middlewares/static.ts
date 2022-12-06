import koaStatic from 'koa-static';
import Koa from 'koa';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serve = koaStatic(join(__dirname, '../../static'), { maxAge: 3600 * 1000, gzip: true });
const serveNoCache = koaStatic(join(__dirname, '../../static'), { gzip: true });
const ignorePattern = /\.html/;

function serveStatic() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx.path === '/' || ignorePattern.test(ctx.path)) {
      return await serveNoCache(ctx, next);
    }
    return await serve(ctx, next);
  });
}

export { serveStatic };
