import Joi from 'joi';
import { PaginationRequest } from '../utils/pagination';
import { ProxyStatus } from './add-http-proxy';

export type ListProxyRequest = PaginationRequest<{}>;

export type ListProxyResponse = ({
  name: string;
  host: string;
  port: number;
  proxyHost: string;
  proxyPort: number;
  proxyProtocol: 'http',
  status: ProxyStatus;
  traffic: { sent: number, received: number };
})[];

export const ListProxyRequestValidator = Joi.object<ListProxyRequest>({
  page: Joi.number().min(0).required(),
  pageSize: Joi.number().min(0).required(),
});

type RunningStatus = 0 | 1;
export type StartOrStopProxyRequest = { name: string; status: RunningStatus };

export type StartOrStopProxyResponse = ListProxyResponse[0];

export const StartOrStopProxyRequestValidator = Joi.object<StartOrStopProxyRequest>({
  status: Joi.number().allow(0, 1).required(),
  name: Joi.string().required(),
});
