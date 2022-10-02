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
    traffic: {
        sent: number;
        received: number;
    };
})[];
export declare const ListProxyRequestValidator: Joi.ObjectSchema<ListProxyRequest>;
declare type RunningStatus = 0 | 1;
export declare type StartOrStopProxyRequest = {
    name: string;
    status: RunningStatus;
};
export declare type StartOrStopProxyResponse = ListProxyResponse[0];
export declare const StartOrStopProxyRequestValidator: Joi.ObjectSchema<StartOrStopProxyRequest>;
export {};
