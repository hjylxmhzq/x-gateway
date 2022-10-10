import Joi from 'joi';
export interface CreateTotpRequest {
    username: string;
    token: string;
    secret: string;
}
export interface CreateTotpResponse {
    success: boolean;
}
export declare const CreateTotpRequestValidator: Joi.ObjectSchema<CreateTotpRequest>;
