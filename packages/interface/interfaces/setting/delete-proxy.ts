import Joi from 'joi';

export interface DeleteProxyRequest {
  name: string;
}

export interface DeleteProxyResponse {
  name: string;
}

export const DeleteProxyRequestValidator = Joi.object<DeleteProxyRequest>({
  name: Joi.string().min(1).max(30).required()
});