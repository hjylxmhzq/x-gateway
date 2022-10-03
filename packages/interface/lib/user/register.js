import Joi from 'joi';
export const RegisterRequestValidator = Joi.object({
    username: Joi.string().min(1).max(100).required(),
    password: Joi.string().min(1).max(100).required(),
    email: Joi.string().min(0).max(100).required(),
    isAdmin: Joi.boolean().required(),
});
