import Joi from 'joi';
export const RequestNewCertRequestValidator = Joi.object({
    domain: Joi.string().min(1).max(100).required(),
    name: Joi.string().min(1).max(200).required(),
});
