import Joi from 'joi';
export const RequestNewCertRequestValidator = Joi.object({
    domain: Joi.string().min(1).max(100).required(),
    name: Joi.string().min(1).max(200).required(),
});
export const SetCertForWebClientRequestValidator = Joi.object({
    name: Joi.string().min(1).max(200).required(),
});
;
;
export const RecreateCertRequestValidator = Joi.object({
    name: Joi.string().min(1).max(200).required(),
});
;
;
export const DeleteCertRequestValidator = Joi.object({
    name: Joi.string().min(1).max(200).required(),
});
