import Router from '@koa/router';
import { GetLogContentRequest, GetLogContentRequestValidator, ListLogFileRequest, ListLogFileRequestValidator } from '@x-gateway/interface/lib';
import { getAllLogs, getLogFileContent } from '../services/log';
import { resFac } from '../utils/response';

const router = new Router({ prefix: '/log' });

router.post('/list-logs', async (ctx, next) => {
  const body = ctx.request.body as ListLogFileRequest;
  try {
    await ListLogFileRequestValidator.validateAsync(body);
    const logFiles = await getAllLogs(body.fromTime, body.toTime);
    ctx.type = 'json';
    ctx.body = resFac(0, logFiles, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/get-log', async (ctx, next) => {
  const body = ctx.request.body as GetLogContentRequest;
  try {
    await GetLogContentRequestValidator.validateAsync(body);
    const content = await getLogFileContent(body.file);
    ctx.type = 'json';
    ctx.body = resFac(0, content, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

export default router;