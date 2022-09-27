import Joi from 'joi';

export interface AddHttpProxyRequest {
  name: string;
  host: string;
  path: string;
  port: number;
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

export interface AddHttpProxyResponse {

}

export const AddHttpRequestValidator = Joi.object<AddHttpProxyRequest>({
  name: Joi.string().min(1).max(30).required(),
  host: Joi.string().min(0).max(200).required(),
  path: Joi.string().required(),
  port: Joi.number().integer().positive().required(),
  proxyHost: Joi.string().min(0).max(200).required(),
  proxyPort: Joi.number().integer().positive().required(),
  proxyProtocol: Joi.string().allow('http'),
});