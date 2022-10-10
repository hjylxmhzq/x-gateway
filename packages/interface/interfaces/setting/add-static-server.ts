import Joi, { string } from "joi";

export interface AddStaticServerRequest {
  name: string;
  root: string;
  suffix: string;
  index: string[];
  host: string;
  port: number;
  maxAge: number;
  etag: boolean;
  certName: string;
  protocol: 'http' | 'https';
  extensions: string[];
  needAuth: boolean;
}

export interface AddStaticServerResponse {

}

export const AddStaticServerRequestValidator = Joi.object<AddStaticServerRequest>({
  name: Joi.string().min(1).max(30).required(),
  host: Joi.string().min(0).max(200).required(),
  root: Joi.string().min(0).max(200).required(),
  suffix: Joi.string().min(0).max(200).required(),
  port: Joi.number().integer().positive().required(),
  maxAge: Joi.number().integer().positive().required(),
  etag: Joi.boolean().required(),
  certName: Joi.string().allow(null, ''),
  index: Joi.array().items(Joi.string()),
  extensions: Joi.array().items(Joi.string()),
  protocol: Joi.string().allow('http', 'https'),
  needAuth: Joi.boolean(),
});