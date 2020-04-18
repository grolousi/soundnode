import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { artistController } from './artist.controller';
import { validateParams, idSchema } from '../middlewares/param-validator';
import { validateBody } from '../middlewares/body.validator';
import { followSchema } from './artists.schema';
import { validateToken } from '../middlewares/token.validator';

export const artistsRouter = async (): Promise<Router> => {
  const router = expressPromiseRouter();
  const controller = await artistController();

  router.get('/:id', validateParams(idSchema), controller.getArtist);
  router.get('/', controller.getAllArtist);
  router.post('/follow', validateToken, validateBody(followSchema), controller.followArtist);

  return router;
};
