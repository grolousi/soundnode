import { Response, Request, NextFunction } from 'express';
import { errorLogger } from '../logger';
import { decodeToken } from '../authentification/utils/jwt';
import { ObjectID } from 'mongodb';

export interface CustomRequest extends Request {
  ctx: { userId: ObjectID; artistId: ObjectID };
}

export const decodeTokenMiddleware = [
  (req: CustomRequest, res: Response, next: NextFunction): void | Response => {
    try {
      const user = decodeToken(req.headers['authorization'].split(' ')[1]);
      if (!req.ctx) {
        req.ctx = { userId: new ObjectID(user.userId), artistId: new ObjectID(user.artistId) };
      }

      next();
    } catch (error) {
      errorLogger(error);
      return res.sendStatus(403);
    }
  }
];
