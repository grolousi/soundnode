import { artistService } from './artist.service';
import { Request, Response } from 'express';
import { errorLogger } from '../logger';
import { ObjectID } from 'mongodb';
import { isEmpty } from 'ramda';
import { CustomRequest } from '../middlewares/token.decoder';

interface ArtistControllerReturnType {
  editArtist: (req: CustomRequest, res: Response) => Promise<Response>;
  getArtist: (req: Request, res: Response) => Promise<Response>;
  getAllArtist: (req: Request, res: Response) => Promise<Response>;
  followArtist: (req: CustomRequest, res: Response) => Promise<Response>;
  unFollowArtist: (req: CustomRequest, res: Response) => Promise<Response>;
}

export const artistController = async (): Promise<ArtistControllerReturnType> => {
  const service = await artistService();

  return {
    editArtist: async (req: CustomRequest, res: Response): Promise<Response> => {
      try {
        const { artistId } = req.ctx;
        const artist = await service.getArtistDetails(artistId);
        if (isEmpty(artist)) {
          //TODO BOOM
          return res.status(400).json('No artists found');
        }
        await service.editArtist(artistId, req.body);
        return res.status(200).json(artistId);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        res.status(500);
      }
    },
    getArtist: async (req: Request, res: Response): Promise<Response> => {
      try {
        const artistId = req.params.id;
        const artist = await service.getArtistDetails(new ObjectID(artistId));
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
    followArtist: async (req: CustomRequest, res: Response): Promise<Response> => {
      try {
        const followersId = req.ctx.artistId;
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
    unFollowArtist: async (req: CustomRequest, res: Response): Promise<Response> => {
      try {
        const followersId = req.ctx.artistId;
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
