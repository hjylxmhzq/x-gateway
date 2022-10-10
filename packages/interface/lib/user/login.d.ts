import Joi from 'joi';
export interface LoginRequest {
    username: string;
    password: string;
    token: string;
}
export interface LoginResponse {
    needToken?: boolean;
}
export declare const LoginRequestValidator: Joi.ObjectSchema<LoginRequest>;
