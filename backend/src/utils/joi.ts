import { string } from 'joi';

export const joiString = string().trim().max(250);
export const joiObjectId = string().regex(/^[0-9a-fA-F]{24}$/);
