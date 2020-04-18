import { artistDal } from '../database/data-access/artist.dal';
import { ArtistType } from '../shared/types/artist.types';
import { ObjectID } from 'mongodb';
import { errorLogger } from '../logger';

interface ArtistServiceReturnType {
  getArtistWithComments: (artistId: string) => Promise<ArtistType[]>;
  getAllArtists: () => Promise<ArtistType[]>;
  followArtist: (followerId: ObjectID, followedId: string) => Promise<boolean>;
}

export const artistService = async (): Promise<ArtistServiceReturnType> => {
  const aDal = await artistDal();

  return {
    getArtistWithComments: (artistId: string): Promise<ArtistType[]> => {
      const artistObjId = new ObjectID(artistId);
      try {
        return aDal.getArtistWithComments(artistObjId);
      } catch (error) {
        errorLogger('artist service : ' + error);
        throw error;
      }
    },
    getAllArtists: aDal.getAllArtists,
    followArtist: async (followerId: ObjectID, followedId: string): Promise<boolean> => {
      const followedObjId = new ObjectID(followedId);

      try {
        return aDal.followArtist(followerId, followedObjId);
      } catch (error) {
        errorLogger('artist service : ' + error);
        throw error;
      }
    }
  };
};
