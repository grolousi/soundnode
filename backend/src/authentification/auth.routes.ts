import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { validateBody } from '../middlewares/body.validator';
import { authSchema } from './auth.schemas';
import { authController } from './auth.controller';

export const authRouter = async (): Promise<Router> => {
  const router = expressPromiseRouter();
  const controller = await authController();
  router.post('/register', validateBody(authSchema), controller.register);
  router.post('/login', validateBody(authSchema), controller.login);

  return router;
};
