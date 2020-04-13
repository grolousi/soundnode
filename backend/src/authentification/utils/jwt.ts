import { randomBytes } from 'crypto';
import { sign, verify, decode } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { ObjectID } from 'mongodb';

export const tokenSecret = process.env.TOKEN_SECRET || randomBytes(64).toString('hex');

export const createToken = (userId: ObjectID): string => {
  return sign({ userId }, tokenSecret, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  return verify(token, tokenSecret, { ignoreExpiration: true });
};
export const decodeToken = (token: string) => {
  return decode(token, { json: true });
};

export const validatePassword = (textPassword, hashedPassword): Promise<boolean> => {
  return compare(textPassword, hashedPassword);
};
