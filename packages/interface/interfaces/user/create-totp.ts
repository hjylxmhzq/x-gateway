import Joi from 'joi';

export interface CreateTotpRequest {
  username: string;
  token: string;
  secret: string;
}

export interface CreateTotpResponse {
  success: boolean;
}

export const CreateTotpRequestValidator = Joi.object<CreateTotpRequest>({
  username: Joi.string().min(1).max(200).required(),
  token: Joi.string().min(1).max(200).required(),
  secret: Joi.string().min(1).max(200).required(),
});