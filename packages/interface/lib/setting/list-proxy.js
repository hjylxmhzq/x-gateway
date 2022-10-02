import Joi from 'joi';
export const ListProxyRequestValidator = Joi.object({
    page: Joi.number().min(0).required(),
    pageSize: Joi.number().min(0).required(),
});
export const StartOrStopProxyRequestValidator = Joi.object({
    status: Joi.number().allow(0, 1).required(),
    name: Joi.string().required(),
});
