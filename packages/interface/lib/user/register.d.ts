import Joi from 'joi';
export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    isAdmin: boolean;
}
export interface RegisterResponse {
}
export declare const RegisterRequestValidator: Joi.ObjectSchema<RegisterRequest>;
