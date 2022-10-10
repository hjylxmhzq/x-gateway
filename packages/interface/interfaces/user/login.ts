import Joi from 'joi';

export interface LoginRequest {
  username: string;
  password: string;
  token: string;
}

export interface LoginResponse {
  needToken?: boolean;
}

export const LoginRequestValidator = Joi.object<LoginRequest>({
  username: Joi.string().min(1).max(100).required(),
  password: Joi.string().min(1).max(100).required(),
  token: Joi.string().allow('', null),
});