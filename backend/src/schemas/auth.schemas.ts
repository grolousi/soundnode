import * as joi from 'joi';

const emailSchema = joi.string().trim().max(200).email().required();
const passwordSchema = joi.string().trim().min(8).max(50).required();
export const authSchema = {
  email: emailSchema,
  password: passwordSchema
};
