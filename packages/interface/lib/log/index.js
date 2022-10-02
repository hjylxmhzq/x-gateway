import Joi from 'joi';
export const ListLogFileRequestValidator = Joi.object({
    fromTime: Joi.number().integer().positive().required(),
    toTime: Joi.number().integer().positive().required(),
});
export const GetLogContentRequestValidator = Joi.object({
    file: Joi.string().required(),
});
