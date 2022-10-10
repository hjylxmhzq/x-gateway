import Joi from "joi";
export const AddStaticServerRequestValidator = Joi.object({
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
