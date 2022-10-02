import { post } from "./common";
import {
  AddHttpProxyRequest, AddHttpProxyResponse, DeleteProxyResponse, ListProxyResponse, ProxyProtocol,
  StartOrStopProxyResponse
} from '@x-gateway/interface';

export interface ProxyParamenter {
  name: string;
  host: string;
  path: string;
  proxyHost: string;
  proxyPort: number;
  proxyProtocol: ProxyProtocol.http
  port: number;
}

export const addHttpProxy = async (proxyParams: ProxyParamenter) => {
  const params: AddHttpProxyRequest = {
    name: proxyParams.name,
    port: proxyParams.port,
    host: proxyParams.host,
    path: proxyParams.path,
    proxyHost: proxyParams.proxyHost,
    proxyPort: proxyParams.proxyPort,
    proxyProtocol: proxyParams.proxyProtocol,
  }
  const result = await post<AddHttpProxyResponse>('/setting/add-proxy', params);
  return result;
}

export const listProxies = async (page = 0, pageSize = 100) => {
  return await post<ListProxyResponse>('/setting/list-proxy', { page, pageSize });
}

export const deleteProxy = async (name: string) => {
  return await post<DeleteProxyResponse>('/setting/delete-proxy', { name });
}

export const startOrStopProxy = async (name: string, status: 0 | 1) => {
  return await post<StartOrStopProxyResponse>('/setting/start-or-stop-proxy', { name, status });
}
