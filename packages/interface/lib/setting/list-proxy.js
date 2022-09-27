import Joi from 'joi';
export const ListProxyRequestValidator = Joi.object({
    page: Joi.number().min(0).required(),
    pageSize: Joi.number().min(0).required(),
});
