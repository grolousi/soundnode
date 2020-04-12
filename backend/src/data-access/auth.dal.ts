import { Request, Response } from 'express';

interface AuthDalReturnType {
  register: (eq: Request, res: Response) => Promise<void>;
}

export const authDal = (): void => {
  console.log('authDal');
};
