import Joi from 'joi';
export const DisableTotpRequestValidator = Joi.object({
    username: Joi.string().min(1).max(200).required(),
});
