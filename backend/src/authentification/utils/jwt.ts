import { randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { ObjectID } from 'mongodb';

export const tokenSecret = process.env.TOKEN_SECRET || randomBytes(64).toString('hex');

export const createToken = (userId: ObjectID): string => {
  return sign({ userId }, tokenSecret);
};

export const validatePassword = (textPassword, hashedPassword): Promise<boolean> => {
  return compare(textPassword, hashedPassword);
};
