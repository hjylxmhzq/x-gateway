import Koa from 'koa';

const ignore = [
  /^\/login$/,
  /^\/user\/login$/,
  /\/static\/.*\.(js|css|map)$/,
  /^\/manifest\.json$/,
  /^\/logo.*\.(png|jpg)/,
];

function userGuard() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    if (process.env.NODE_ENV?.includes('development')) {
      ctx.session.isLogin = true;
      ctx.session.username = 'admin';
      await next();
      return;
    }
    if (ignore.some(i => i.test(ctx.path))) {
      await next();
      return;
    }
    if (ctx.session.isLogin && ctx.session.isAdmin) {
      await next();
      return;
    }
    const successRedirect = `${ctx.protocol}://${ctx.host}${ctx.path}${ctx.querystring ? '?' + ctx.querystring : ''}`;
    const redirectTo = `http://${ctx.hostname}:${process.env.WEB_CLIENT_PORT || 8100}/login?redirect=${encodeURIComponent(successRedirect)}`;
    ctx.redirect(redirectTo);
    await next();
  });
}

export { userGuard };
