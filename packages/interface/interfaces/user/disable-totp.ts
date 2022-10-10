import Joi from 'joi';

export interface DisableTotpRequest {
  username: string;
}

export interface DisableTotpResponse {
  success: boolean;
}

export const DisableTotpRequestValidator = Joi.object<DisableTotpRequest>({
  username: Joi.string().min(1).max(200).required(),
});