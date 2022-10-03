import Joi from 'joi';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
}

export const LoginRequestValidator = Joi.object<LoginRequest>({
  username: Joi.string().min(1).max(100).required(),
  password: Joi.string().min(1).max(100).required(),
});