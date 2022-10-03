import Joi from "joi";

export interface GetProxyTrafficRequest {
  name: string;
}

export interface GetProxyTrafficItem {
  proxyName: string;
  trafficSent: number;
  trafficReceived: number;
  requestCount: number;
  time: string;
  realTime: number;
}

export type GetProxyTrafficResponse = GetProxyTrafficItem[];
export type GetAllProxyTrafficResponse = GetProxyTrafficItem[];

export const GetProxyTrafficRequestValidator = Joi.object<GetProxyTrafficRequest>({
  name: Joi.string().min(1).max(100).required(),
});