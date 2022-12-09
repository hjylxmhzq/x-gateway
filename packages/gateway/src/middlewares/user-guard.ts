import Koa from 'koa';
import { getConfig } from '../utils/config';

const ignore = [
  /^\/login$/,
  /^\/.+\.ico$/,
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
    const useHttps = getConfig('https') === 'true';
    const webClientPort = useHttps
    ? parseInt(process.env.WEB_CLIENT_HTTPS_PORT || '8100', 10)
    : parseInt(process.env.WEB_CLIENT_PORT || '8443', 10);
    const protocol = useHttps ? 'https' : 'http';
    const successRedirect = `${ctx.protocol}://${ctx.host}${ctx.path}${ctx.querystring ? '?' + ctx.querystring : ''}`;
    const redirectTo = `${protocol}://${ctx.hostname}:${webClientPort}/login?redirect=${encodeURIComponent(successRedirect)}`;
    ctx.redirect(redirectTo);
    await next();
  });
}

export { userGuard };
