import { badRequest, unauthorized } from 'boom';
import { hash } from 'bcrypt';
import { authService } from './auth.service';
import { Request, Response } from 'express';
import { createToken, validatePassword } from './utils/jwt';
import { UserType } from '../types/user.types';
import { errorLogger } from '../logger';

interface AuthControllerReturnType {
  register: (req: Request, res: Response) => Promise<Response>;
  login: (req: Request, res: Response) => Promise<Response>;
}

const userPresenter = (user: UserType): UserType => {
  return { ...user, password: undefined };
};

export const authController = async (): Promise<AuthControllerReturnType> => {
  const service = await authService();
  return {
    register: async (req: Request, res: Response): Promise<Response> => {
      try {
        const existingUser = await service.getUserByEmail(req.body.email);
        if (existingUser) {
          const boomed = badRequest('email used');
          return res.status(boomed.output.statusCode).json(boomed.output.payload);
        }
        const user = req.body;
        const passwordHash = await hash(user.password, 12);
        const response = await service.createUser({ ...user, password: passwordHash });

        return res
          .append('Authorization', `Bearer ${createToken(response.insertedId)}`)
          .status(201)
          .json(userPresenter(user));
      } catch (error) {
        errorLogger(error);
        return res.status(500);
      }
    },
    login: async (req: Request, res: Response): Promise<Response> => {
      try {
        const user = await service.getUserByEmail(req.body.email);
        if (user && (await validatePassword(req.body.password, user.password))) {
          return res
            .append('Authorization', `Bearer ${createToken(user._id)}`)
            .status(200)
            .json(userPresenter(user));
        }
        const boomed = unauthorized();
        return res.status(boomed.output.statusCode).json(boomed.output.payload);
      } catch (error) {
        errorLogger(error);
        return res.status(500);
      }
    }
  };
};
