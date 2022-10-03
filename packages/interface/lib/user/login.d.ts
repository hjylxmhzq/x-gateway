import Joi from 'joi';
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
}
export declare const LoginRequestValidator: Joi.ObjectSchema<LoginRequest>;
