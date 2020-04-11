import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { tracksController } from './tracks-controller';

export const tracksRouter = (): Router => {
  const router = expressPromiseRouter();

  router.get('/:trackId', tracksController.getTrack);
  router.post('/', tracksController.uploadTrack);

  return router;
};
