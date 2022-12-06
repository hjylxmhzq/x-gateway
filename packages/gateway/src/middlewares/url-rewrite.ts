import Koa from 'koa';

const rewriteMap = {
  '/login': '/',
  '/cert': '/',
  '/user': '/',
  '/log': '/',
  '/traffic': '/',
};

const hasOwn = (obj: any, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

function urlRewrite() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx.method.toLowerCase() === 'get' && hasOwn(rewriteMap, ctx.path)) {
      const querystring = ctx.querystring;
      ctx.url = rewriteMap[ctx.path as keyof typeof rewriteMap];
      if (querystring) {
        ctx.url += `?${querystring}`;
      }
      console.log('new url: ' + ctx.url);
    }
    await next();
  });
}

export { urlRewrite };
