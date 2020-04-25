import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { tracksController } from './tracks.controller';
import { validateToken } from '../middlewares/token.validator';
import { validateBody } from '../middlewares/body.validator';
import { likeSchema, unLikeSchema, addCommentSchema, UpdateTrackInfosSchema } from './tracks.schema';
import { decodeTokenMiddleware } from '../middlewares/token.decoder';
import { validateParams, idSchema } from '../middlewares/param-validator';

export const tracksRouter = async (): Promise<Router> => {
  const router = expressPromiseRouter();
  const controller = await tracksController();

  router.get('/:trackId', controller.getTrack);
  router.post('/', validateToken, decodeTokenMiddleware, controller.uploadTrack);
  router.post('/like', validateToken, decodeTokenMiddleware, validateBody(likeSchema), controller.likeTrack);
  router.post(
    '/unlike',
    validateToken,
    decodeTokenMiddleware,
    validateBody(unLikeSchema),
    controller.unlikeTrack
  );
  router.post(
    '/comment',
    validateToken,
    decodeTokenMiddleware,
    validateBody(addCommentSchema),
    controller.addCommentToTrack
  );
  router.patch(
    '/:id',
    validateToken,
    decodeTokenMiddleware,
    validateBody(UpdateTrackInfosSchema),
    controller.editTrack
  );
  router.delete(
    '/:id',
    validateToken,
    decodeTokenMiddleware,
    validateParams(idSchema),
    controller.deleteTrack
  );

  return router;
};
