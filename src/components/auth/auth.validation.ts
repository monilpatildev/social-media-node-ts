import Joi from "joi";

export const validateEmailPassword = (data: object) => {
  const patchSchema = Joi.object({
    email: Joi.string().empty("").email().lowercase().messages({
      "string.base": "email must be a string",
      "string.email": "email must be a valid email",
      "string.empty": "email cannot be empty",
      "any.required": "email is required",
    }),
    password: Joi.string().empty("").min(8).messages({
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
