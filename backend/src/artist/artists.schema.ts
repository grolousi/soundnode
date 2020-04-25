import { joiString } from '../utils/joi';
import { any } from 'joi';

export const followSchema = {
  followedId: any().required()
};

export const unFollowSchema = {
  followedId: any().required()
};

export const editArtistSchema = {
  name: joiString.optional(),
  description: joiString.optional()
};
