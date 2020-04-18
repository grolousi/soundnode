import { verifyToken } from '../authentification/utils/jwt';
import { Response, Request, NextFunction } from 'express';
import { errorLogger } from '../logger';

export const validateToken = [
  (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      verifyToken(req.headers['authorization'].split(' ')[1]);

      next();
    } catch (error) {
      errorLogger(error);
      return res.sendStatus(403);
    }
  }
];
