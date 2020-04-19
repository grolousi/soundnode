import expressPromiseRouter from 'express-promise-router';
import { Router } from 'express';
import { tracksController } from './tracks.controller';
import { validateToken } from '../middlewares/token.validator';
import { validateBody } from '../middlewares/body.validator';
import { likeSchema, unLikeSchema, addCommentSchema } from './tracks.schema';

export const tracksRouter = async (): Promise<Router> => {
  const router = expressPromiseRouter();
  const controller = await tracksController();

  router.get('/:trackId', controller.getTrack);
  router.post('/', validateToken, controller.uploadTrack);
  router.post('/like', validateToken, validateBody(likeSchema), controller.likeTrack);
  router.post('/unlike', validateToken, validateBody(unLikeSchema), controller.unlikeTrack);
  router.post('/comment', validateToken, validateBody(addCommentSchema), controller.addCommentToTrack);

  return router;
};
