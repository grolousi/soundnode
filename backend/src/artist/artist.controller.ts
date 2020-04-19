import { artistService } from './artist.service';
import { Request, Response } from 'express';
import { errorLogger } from '../logger';
import { ObjectID } from 'mongodb';
import { decodeToken } from '../authentification/utils/jwt';
import { isEmpty } from 'ramda';

interface ArtistControllerReturnType {
  getArtist: (req: Request, res: Response) => Promise<Response>;
  getAllArtist: (req: Request, res: Response) => Promise<Response>;
  followArtist: (req: Request, res: Response) => Promise<Response>;
  unFollowArtist: (req: Request, res: Response) => Promise<Response>;
}

export const artistController = async (): Promise<ArtistControllerReturnType> => {
  const service = await artistService();

  return {
    getArtist: async (req: Request, res: Response): Promise<Response> => {
      try {
        const artistId = req.params.id;
        const artist = await service.getArtistDetails(artistId);
        if (isEmpty(artist)) {
          //TODO BOOM
          return res.status(400).json('No artists found');
        }
        return res.status(200).json(artist);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        res.status(500);
      }
    },
    getAllArtist: async (_: Request, res: Response): Promise<Response> => {
      try {
        const artists = await service.getAllArtists();
        return res.status(200).json(artists);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        res.status(500);
      }
    },
    followArtist: async (req: Request, res: Response): Promise<Response> => {
      try {
        const followersId = decodeToken(req.headers.authorization.split(' ')[1]).artistId;
        const { followedId } = req.body;

        const result = await service.followArtist(new ObjectID(followersId), followedId);
        if (!result) {
          const err = 'error trying to follow someone';
          errorLogger(err);
          //TODO BOOM
          return res.status(500).json(err);
        }
        return res.status(200).json(followedId);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        res.status(500);
      }
    },
    unFollowArtist: async (req: Request, res: Response): Promise<Response> => {
      try {
        const followersId = decodeToken(req.headers.authorization.split(' ')[1]).artistId;
        const { followedId } = req.body;
        const result = await service.unFollowArtist(new ObjectID(followersId), followedId);
        if (!result) {
          const err = 'error trying to follow someone';
          errorLogger(err);
          //TODO BOOM
          return res.status(500).json(err);
        }
        return res.status(200).json(followedId);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        res.status(500);
      }
    }
  };
};
