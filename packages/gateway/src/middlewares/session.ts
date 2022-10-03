import sessionManager from "../utils/session";
import type Koa from 'koa';

export function session() {
  return sessionManager.mw();
}