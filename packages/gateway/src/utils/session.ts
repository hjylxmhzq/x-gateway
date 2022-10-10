import { IncomingMessage, ServerResponse } from 'http';
import Koa from 'koa';
import cookie from 'cookie';
import { v4 as uuidv4 } from 'uuid';
import { getConfig } from './config';

const SESSION_KEY_NAME = 'x-gateway-sess-key'

declare module 'koa' {
  interface DefaultContext {
    session: Session;
  }
}

type Session = ReturnType<typeof createDefaultSession>;

const createDefaultSession = () => {
  return {
    _isLogin: false,
    get isLogin() {
      return this._isLogin && Date.now() < this.expire
    },
    set isLogin(v: boolean) {
      this._isLogin = v;
      if (v) {
        this.expire = Date.now() + 3600 * 24 * 1000;
      }
    },
    isAdmin: false,
    username: '',
    expire: Date.now() + 3600 * 24 * 1000,
  }
}

class SessionManager {
  sessionMap = new Map<string, Session>();
  getSessionFromKey(key: string) {
    let session = this.sessionMap.get(key);
    if (!session) {
      session = createDefaultSession();
    }
    this.sessionMap.set(key, session);
    return session;
  }
  getSessionFromReq(req: IncomingMessage, res?: ServerResponse) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionKey = cookies[SESSION_KEY_NAME];
    if (sessionKey) {
      return this.getSessionFromKey(sessionKey);
    } else {
      if (res) {
        res.setHeader('set-cookie', cookie.serialize(SESSION_KEY_NAME, uuidv4(), { maxAge: 3600 * 24 * 30 * 1000, httpOnly: true }));
      }
    }
  }

  authFn = async (req: IncomingMessage) => {
    const session = sessionManager.getSessionFromReq(req);
    if (!session) return false;
    if (!session.isLogin) return false;
    return true;
  }

  mw() {
    return async (ctx: Koa.Context, next: Koa.Next) => {
      let sessionKey = ctx.cookies.get(SESSION_KEY_NAME);
      if (!sessionKey) {
        sessionKey = uuidv4();
        ctx.cookies.set(SESSION_KEY_NAME, sessionKey, { httpOnly: true, maxAge: 3600 * 24 * 30 * 1000 });
      }
      ctx.session = this.getSessionFromKey(sessionKey);
      await next();
    }
  }
}

export function redirectToLogin(protocol: 'http' | 'https', host: string, path: string, querystring?: string) {
  const hostname = host.split(':')[0];
  const useHttps = getConfig('https') === 'true';
  const webClientPort = useHttps
    ? parseInt(process.env.WEB_CLIENT_HTTPS_PORT || '8100', 10)
    : parseInt(process.env.WEB_CLIENT_PORT || '8443', 10);
  const loginProtocol = useHttps ? 'https' : 'http';
  const successRedirect = `${protocol}://${host}${path}${querystring ? '?' + querystring : ''}`;
  const redirectTo = `${loginProtocol}://${hostname}:${webClientPort}/login?redirect=${encodeURIComponent(successRedirect)}`;
  return redirectTo;
}

const sessionManager = new SessionManager();

export default sessionManager;