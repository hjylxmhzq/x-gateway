import fs from 'fs-extra';
import Koa from 'koa';
import path from 'path';
// just avoid rollup tree shaking
import './user';

const url = new URL(import.meta.url);
const dirname = path.dirname(url.pathname);
const routers = fs.readdirSync(dirname).filter(router => !router.startsWith('index'));
const routes: () => Koa.Middleware = () => async (state, ctx) => {
  for (let router of routers) {
    const module = await import('./' + router);
    module.default.routes()(state, ctx);
  }
}

export default routes;