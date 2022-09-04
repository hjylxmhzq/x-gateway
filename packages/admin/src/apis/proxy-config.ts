import { post } from "./common";
import { AddProxyRequest, AddProxyResponse, ProxyProtocol } from '@x-gateway/interface';

export interface ProxyParamenter {
  name: string;
  host: RegExp;
  path: RegExp;
  proxyHost: string;
  proxyPort: number;
  proxyProtocol: ProxyProtocol.http
}

export const addProxy = async (proxyParams: ProxyParamenter) => {
  const params: AddProxyRequest = {
    name: proxyParams.name,
    host: proxyParams.host.source,
    path: proxyParams.path.source,
    proxyHost: proxyParams.proxyHost,
    proxyPort: proxyParams.proxyPort,
    proxyProtocol: proxyParams.proxyProtocol,
  }
  const result = await post<AddProxyResponse>('/setting/add-proxy', params);
  return result;
}