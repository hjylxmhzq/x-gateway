export interface AddProxyRequest {
  name: string;
  host: string;
  path: string;
  proxyHost: string;
  proxyPort: number;
  proxyProtocol: ProxyProtocol
}

export enum ProxyProtocol {
  http = 'http',
}

export enum ProxyStatus {
  stopped = 0,
  running = 1,
}

export interface AddProxyResponse {
  name: string;
  host: string;
  proxyHost: string;
  proxyPort: number;
  proxyProtocol: 'http',
  status: ProxyStatus,
}