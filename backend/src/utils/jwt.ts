import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { ObjectID } from 'mongodb';

export const tokenSecret = process.env.TOKEN_SECRET || crypto.randomBytes(64).toString('hex');

export const createToken = (userId: ObjectID): string => {
  return jwt.sign({ userId }, tokenSecret);
};

export const validatePassword = (textPassword, hashedPassword): Promise<boolean> => {
  return bcrypt.compare(textPassword, hashedPassword);
};
