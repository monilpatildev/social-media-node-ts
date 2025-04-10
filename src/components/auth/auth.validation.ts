import Joi from "joi";
import { IAuthenticateQuery } from "../../common/interfaces";

export const validateEmailPassword = (data: IAuthenticateQuery) => {
  const patchSchema = Joi.object({
    email: Joi.string().empty("").required().email().lowercase().messages({
      "string.base": "email must be a string",
      "string.email": "email must be a valid email",
      "string.empty": "email cannot be empty",
      "any.required": "email is required",
    }),
    password: Joi.string().empty("").required().min(8).messages({
      "string.base": "password must be a string",
      "string.empty": "password cannot be empty",
      "any.required": "password is required",
    }),
  });

  return patchSchema.validate(data, {
    abortEarly: false,
    errors: { wrap: { label: "" } },
  });
};
