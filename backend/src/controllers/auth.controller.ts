import * as boom from 'boom';
import * as bcrypt from 'bcrypt';
import { userDal } from '../data-access/user.dal';
import { Request, Response } from 'express';
import { createToken, validatePassword } from '../utils/jwt';
import { UserType } from '../types/user.types';

interface AuthControllerReturnType {
  register: (req: Request, res: Response) => Promise<Response>;
  login: (req: Request, res: Response) => Promise<Response>;
}

const userPresenter = (user: UserType): UserType => {
  return { ...user, password: undefined };
};

export const authController = async (): Promise<AuthControllerReturnType> => {
  const uDal = await userDal();
  return {
    register: async (req: Request, res: Response): Promise<Response> => {
      const existingUser = await uDal.getUser(req.body.email);
      console.log('existingUser', existingUser);
      if (existingUser) {
        const boomed = boom.badRequest('email used');
        return res.status(boomed.output.statusCode).json(boomed.output.payload);
      }
      const user = req.body;
      const passwordHash = await bcrypt.hash(user.password, 12);
      const response = await uDal.createUser({ ...user, password: passwordHash });

      return res
        .append('Authorization', `Bearer ${createToken(response.insertedId)}`)
        .status(201)
        .json(userPresenter(user));
    },
    login: async (req: Request, res: Response): Promise<Response> => {
      const user = await uDal.getUser(req.body.email, true);
      console.log('user', user);
      console.log('reqpass', req.body.password);
      if (user && (await validatePassword(req.body.password, user.password))) {
        return res
          .append('Authorization', `Bearer ${createToken(user._id)}`)
          .status(200)
          .json(userPresenter(user));
      }
      const boomed = boom.unauthorized();
      return res.status(boomed.output.statusCode).json(boomed.output.payload);
    }
  };
};
