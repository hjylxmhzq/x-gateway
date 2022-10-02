import Koa from 'koa';
import { logger } from '../utils/logger';
import requestIp from 'request-ip';

function requestLogger() {
  return (async (ctx: Koa.Context, next: Koa.Next) => {
    const realIp = requestIp.getClientIp(ctx.request);
    logger.info(`${ctx.request.method.toUpperCase()} ${realIp} ${ctx.request.path}`);
    await next();
  });
}

export { requestLogger };