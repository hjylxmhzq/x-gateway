import Joi from 'joi';
export interface DeleteProxyRequest {
    name: string;
}
export interface DeleteProxyResponse {
    name: string;
}
export declare const DeleteProxyRequestValidator: Joi.ObjectSchema<DeleteProxyRequest>;
