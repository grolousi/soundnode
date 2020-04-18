import { sign, verify, decode } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { randomBytes } from 'crypto';
import { CreateUserReturnType } from '../../shared/types/user.types';

export const tokenSecret = process.env.TOKEN_SECRET || randomBytes(64).toString('hex');

export const createToken = (tokenArg: CreateUserReturnType): string => {
  return sign(tokenArg, tokenSecret, { expiresIn: '1d' });
};

export const verifyToken = (token: string): string | object => {
  return verify(token, tokenSecret, { ignoreExpiration: true });
};

export const decodeToken = (token: string): { artistId: string; userId: string } => {
  return decode(token, { json: true }) as { artistId: string; userId: string };
};

export const validatePassword = (textPassword, hashedPassword): Promise<boolean> => {
  return compare(textPassword, hashedPassword);
};
