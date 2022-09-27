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
  status: ProxyStatus,
})[];

export const ListProxyRequestValidator = Joi.object<ListProxyRequest>({
  page: Joi.number().min(0).required(),
  pageSize: Joi.number().min(0).required(),
});