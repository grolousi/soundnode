import { badRequest, unauthorized } from 'boom';
import { hash } from 'bcrypt';
import { authService } from './auth.service';
import { Request, Response } from 'express';
import { createToken, validatePassword } from './utils/jwt';
import { UserType } from '../shared/types/user.types';
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
        const existingUserByEmail = await service.getUserByEmail(req.body.email);

        if (existingUserByEmail) {
          const boomed = badRequest('email already used');
          return res.status(boomed.output.statusCode).json(boomed.output.payload);
        }
        const existingUserByName = await service.getUserByUserName(req.body.userName);

        if (existingUserByName) {
          const boomed = badRequest('name alreay used');
          return res.status(boomed.output.statusCode).json(boomed.output.payload);
        }

        const user = req.body;
        const passwordHash = await hash(user.password, 12);
        const response = await service.createUser({ ...user, password: passwordHash });
        const fullUser = await service.getUserByEmail(req.body.email);

        return res
          .append('Authorization', `Bearer ${createToken(response)}`)
          .status(201)
          .json(userPresenter(fullUser));
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
            .append('Authorization', `Bearer ${createToken({ userId: user._id, artistId: user.artistId })}`)
            .status(200)
            .json(userPresenter(user));
        }
        const boomed = unauthorized();
        return res.status(boomed.output.statusCode).json(boomed.output.payload);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        return res.status(500);
      }
    }
  };
};
