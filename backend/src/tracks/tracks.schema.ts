import { any, string } from 'joi';

export const likeSchema = {
  trackId: any().required()
};

export const unLikeSchema = {
  trackId: any().required()
};

export const addCommentSchema = {
  trackId: any().required(),
  comment: string().trim().max(250).required()
};
