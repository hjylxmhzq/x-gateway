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
export declare type GetProxyTrafficResponse = GetProxyTrafficItem[];
export declare type GetAllProxyTrafficResponse = GetProxyTrafficItem[];
export declare const GetProxyTrafficRequestValidator: Joi.ObjectSchema<GetProxyTrafficRequest>;
