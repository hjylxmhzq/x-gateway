import Joi from 'joi';

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  isAdmin: boolean;
}

export interface RegisterResponse {
}

export const RegisterRequestValidator = Joi.object<RegisterRequest>({
  username: Joi.string().min(1).max(100).required(),
  password: Joi.string().min(1).max(100).required(),
  email: Joi.string().min(0).max(100).required(),
  isAdmin: Joi.boolean().required(),
});