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

export const UpdateTrackInfosSchema = {
  title: string().trim().max(50).optional(),
  description: string().trim().max(250).optional(),
  cover: string().optional()
};
