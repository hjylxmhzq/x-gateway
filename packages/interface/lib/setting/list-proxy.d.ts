import Joi from 'joi';
import { PaginationRequest } from '../utils/pagination';
import { ProxyStatus } from './add-http-proxy';
export declare type ListProxyRequest = PaginationRequest<{}>;
export declare type ListProxyResponse = ({
    name: string;
    host: string;
    port: number;
    proxyHost: string;
    proxyPort: number;
    proxyProtocol: 'http';
    status: ProxyStatus;
})[];
export declare const ListProxyRequestValidator: Joi.ObjectSchema<ListProxyRequest>;
