import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { tracksController } from './tracks.controller';
import { validateToken } from '../middlewares/token.validator';

export const tracksRouter = async (): Promise<Router> => {
  const router = expressPromiseRouter();
  const controller = await tracksController();

  router.get('/:trackId', controller.getTrack);
  router.post('/', validateToken, controller.uploadTrack);

  return router;
};
