import Joi from "joi";
export interface DeleteUserRequest {
    name: string;
}
export declare const DeleteUserRequestValidator: Joi.ObjectSchema<DeleteUserRequest>;
