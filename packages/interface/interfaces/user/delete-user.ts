import Joi from "joi";

export interface DeleteUserRequest {
  name: string;
}

export const DeleteUserRequestValidator = Joi.object<DeleteUserRequest>({
  name: Joi.string().min(1).max(100).required(),
});