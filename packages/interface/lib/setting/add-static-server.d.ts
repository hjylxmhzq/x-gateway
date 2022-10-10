import Joi from "joi";
export interface AddStaticServerRequest {
    name: string;
    root: string;
    suffix: string;
    index: string[];
    host: string;
    port: number;
    maxAge: number;
    etag: boolean;
    certName: string;
    protocol: 'http' | 'https';
    extensions: string[];
    needAuth: boolean;
}
export interface AddStaticServerResponse {
}
export declare const AddStaticServerRequestValidator: Joi.ObjectSchema<AddStaticServerRequest>;
