import Joi from "joi";
export declare type TypeToSchema<T> = {
    [K in keyof T]: Joi.Schema;
};
