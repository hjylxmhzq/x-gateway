import { AddStaticServerRequest } from "@x-gateway/interface/lib";
import sessionManager from "../utils/session";
import staticServerManager from "../utils/static-server-manager";

export function addStaticServer(options: AddStaticServerRequest) {
  return staticServerManager.addStaticServer({
    ...options,
    authFn: sessionManager.authFn,
  });
}