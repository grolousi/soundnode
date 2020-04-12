import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { tracksController } from '../controllers/tracks.controller';

export const tracksRouter = async (): Promise<Router> => {
  const router = expressPromiseRouter();
  const controller = await tracksController();

  router.get('/:trackId', controller.getTrack);
  router.post('/', controller.uploadTrack);

  return router;
};
