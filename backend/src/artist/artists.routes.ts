import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { artistController } from './artist.controller';
import { validateParams, idSchema } from '../middlewares/param-validator';
import { validateBody } from '../middlewares/body.validator';
import { followSchema, unFollowSchema, editArtistSchema } from './artists.schema';
import { validateToken } from '../middlewares/token.validator';
import { decodeTokenMiddleware } from '../middlewares/token.decoder';

export const artistsRouter = async (): Promise<Router> => {
  const router = expressPromiseRouter();
  const controller = await artistController();

  router.get('/:id', validateParams(idSchema), controller.getArtist);
  router.get('/', controller.getAllArtist);
  router.post(
    '/follow',
    validateToken,
    decodeTokenMiddleware,
    validateBody(followSchema),
    controller.followArtist
  );
  router.post(
    '/unfollow',
    validateToken,
    decodeTokenMiddleware,
    validateBody(unFollowSchema),
    controller.unFollowArtist
  );
  router.patch(
    '/',
    validateToken,
    decodeTokenMiddleware,
    validateBody(editArtistSchema),
    controller.editArtist
  );

  return router;
};
