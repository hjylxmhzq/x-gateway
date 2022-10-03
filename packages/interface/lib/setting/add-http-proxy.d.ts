import Joi from 'joi';
export interface AddHttpProxyRequest {
    name: string;
    host: string;
    path: string;
    port: number;
    proxyHost: string;
    proxyPort: number;
    proxyProtocol: ProxyProtocol;
    certName: string;
}
export declare enum ProxyProtocol {
    http = "http"
}
export declare enum ProxyStatus {
    running = "running",
    starting = "starting",
    stoppping = "stopping",
    stopped = "stopped"
}
export interface AddHttpProxyResponse {
}
export declare const AddHttpRequestValidator: Joi.ObjectSchema<AddHttpProxyRequest>;
