import Joi from 'joi';
export const LoginRequestValidator = Joi.object({
    username: Joi.string().min(1).max(100).required(),
    password: Joi.string().min(1).max(100).required(),
    token: Joi.string().allow('', null),
});
