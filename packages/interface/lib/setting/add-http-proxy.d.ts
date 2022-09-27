import Joi from 'joi';
export interface AddHttpProxyRequest {
    name: string;
    host: string;
    path: string;
    port: number;
    proxyHost: string;
    proxyPort: number;
    proxyProtocol: ProxyProtocol;
}
export declare enum ProxyProtocol {
    http = "http"
}
export declare enum ProxyStatus {
    stopped = 0,
    running = 1
}
export interface AddHttpProxyResponse {
}
export declare const AddHttpRequestValidator: Joi.ObjectSchema<AddHttpProxyRequest>;
