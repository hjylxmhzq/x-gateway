import Koa from 'koa';
import { logger } from '../utils/logger';
import requestIp from 'request-ip';
import geoip from 'geoip-lite';

function requestLogger() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    const realIp = requestIp.getClientIp(ctx.request);
    const geo = geoip.lookup(realIp || '');
    const geoInfo = geo ? `${geo.country}/${geo.region}/${geo.city}` : 'unknown ip location';
    logger.info(`${ctx.request.method.toUpperCase()} ${realIp}(${geoInfo}) ${ctx.request.path}`);
    await next();
  });
}

export { requestLogger };
