import Joi from 'joi';
export interface DisableTotpRequest {
    username: string;
}
export interface DisableTotpResponse {
    success: boolean;
}
export declare const DisableTotpRequestValidator: Joi.ObjectSchema<DisableTotpRequest>;
