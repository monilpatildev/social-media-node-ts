import Joi from "joi";
import { IUser } from "./user.model";

export const validateUser = (data: IUser, isPatch: boolean = false) => {
  const userSchema = Joi.object({
    firstName: Joi.string()
      .trim()
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "firstName must be a string",
        "string.empty": "firstName cannot be empty",
        "any.required": "firstName is required",
      }),
    lastName: Joi.string()
      .trim()
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "lastName must be a string",
        "string.empty": "lastName cannot be empty",
        "any.required": "lastName is required",
      }),
    email: Joi.string()
      .trim()
      .email()
      .lowercase()
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "email must be a string",
        "string.email": "email must be a valid email",
        "string.empty": "email cannot be empty",
        "any.required": "email is required",
      }),
    password: Joi.string()
      .trim()
      .min(8)
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "password must be a string",
        "string.empty": "password cannot be empty",
        "string.min": "password should have at least 8 characters",
        "any.required": "password is required",
      }),
    username: Joi.string()
      .trim()
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "username must be a string",
        "string.empty": "username cannot be empty",
        "any.required": "username is required",
      }),
    bio: Joi.string().trim().max(100).messages({
      "string.base": "bio must be a string",
      "string.min": "bio should can be max 100 characters",
    }),
    isPrivate: Joi.boolean().messages({
      "boolean.base": "isPrivate must be true or false",
      "any.required": "isPrivate is required",
    }),
  });

  return userSchema.validate(data, {
    abortEarly: false,
    context: { isPatch },
    errors: { wrap: { label: "" } },
  });
};
