import Joi from "joi";
export const GetProxyTrafficRequestValidator = Joi.object({
    name: Joi.string().min(1).max(100).required(),
});
