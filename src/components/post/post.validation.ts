import Joi from "joi";
import { IUploadedFile } from "../../common/interfaces";

export const validatePost = (data: any, isPatch: boolean = false) => {
  const postSchema = Joi.object({
    title: Joi.string()
      .empty("")
      .max(30)
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "title must be a string",
        "string.empty": "title cannot be empty",
        "string.min": "title can be max 30 characters",
        "any.required": "title is required",
      }),
    description: Joi.string()
      .empty("")
      .max(200)
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "description must be a string",
        "string.empty": "description cannot be empty",
        "string.max": "description can be max 200 characters",
        "any.required": "description is required",
      }),
  });

  return postSchema.validate(data, {
    abortEarly: false,
    context: { isPatch },
    errors: { wrap: { label: "" } },
  });
};
