import * as joi from 'joi';

export const joiString = joi.string().trim().max(250);
