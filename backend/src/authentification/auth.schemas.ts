import * as joi from 'joi';

const emailSchema = joi.string().trim().max(200).email().required();
const passwordSchema = joi.string().trim().min(8).max(50).required();
const userNameSchema = joi.string().trim().min(3).max(50).required();
export const loginSchema = {
  email: emailSchema,
  password: passwordSchema
};
export const registerSchema = {
  userName: userNameSchema,
  email: emailSchema,
  password: passwordSchema
};
