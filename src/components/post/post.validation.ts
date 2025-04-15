import Joi from "joi";
import { IPost } from "./post.model";

export const validatePost = (data: IPost, isPatch: boolean = false) => {
  const postSchema = Joi.object({
    title: Joi.string()
      .trim()
      .max(100)
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "title must be a string",
        "string.empty": "title cannot be empty",
        "string.min": "title can be max 100 characters",
        "any.required": "title is required",
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .when("$isPatch", {
        is: true,
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      })
      .messages({
        "string.base": "description must be a string",
        "string.empty": "description cannot be empty",
        "string.max": "description can be max 500 characters",
        "any.required": "description is required",
      }),
  });

  return postSchema.validate(data, {
    abortEarly: false,
    context: { isPatch },
    errors: { wrap: { label: "" } },
  });
};
