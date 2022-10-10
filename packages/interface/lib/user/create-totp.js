import Joi from 'joi';
export const CreateTotpRequestValidator = Joi.object({
    username: Joi.string().min(1).max(200).required(),
    token: Joi.string().min(1).max(200).required(),
    secret: Joi.string().min(1).max(200).required(),
});
