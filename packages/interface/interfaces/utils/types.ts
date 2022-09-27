import Joi from "joi"

export type TypeToSchema<T> = { [K in keyof T]: Joi.Schema };