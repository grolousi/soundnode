import { joiString } from '../utils/joi';
import { any } from 'joi';

export const editArtistSchema = {
  name: joiString.optional(),
  description: joiString.optional()
};

export const followSchema = {
  followedId: any().required()
};
