import { string } from 'joi';

export const joiString = string().trim().max(250);
