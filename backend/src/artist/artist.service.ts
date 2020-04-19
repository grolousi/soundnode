import { artistDal } from '../database/data-access/artist.dal';
import { ArtistType, PopulatedArtistTypeWPopulatedTracks } from '../shared/types/artist.types';
import { ObjectID } from 'mongodb';
import { errorLogger } from '../logger';
import { AddTrackInfosReturnType } from '../shared/types/tracks.types';
import { commentDal } from '../database/data-access/comments.dal';

interface ArtistServiceReturnType {
  getArtistDetails: (artistId: string) => Promise<PopulatedArtistTypeWPopulatedTracks>;
  getAllArtists: () => Promise<ArtistType[]>;
  followArtist: (followerId: ObjectID, followedId: string) => Promise<boolean>;
  unFollowArtist: (followerId: ObjectID, followedId: string) => Promise<boolean>;
}

export const artistService = async (): Promise<ArtistServiceReturnType> => {
  const aDal = await artistDal();
  const cDal = await commentDal();

  return {
    getArtistDetails: async (artistId: string): Promise<PopulatedArtistTypeWPopulatedTracks> => {
      const artistObjId = new ObjectID(artistId);
      try {
        const artist = await aDal.getArtistWithComments(artistObjId);
        const result = {
          ...artist[0],
          tracks: await Promise.all(
            artist[0].tracks.map(async (track: AddTrackInfosReturnType) => {
              return {
                ...track,
                comments: await Promise.all(
                  track.comments.map(async (commentId: ObjectID) => {
                    const popComment = await cDal.getComment(commentId);
                    const artistName = await aDal.getArtistName(popComment.artistId);
                    return { ...popComment, artistName };
                  })
                )
              };
            })
          ),
          followers: await Promise.all(
            artist[0].followers.map(async (follower: ObjectID) => {
              return { followerId: follower, name: await aDal.getArtistName(follower) };
            })
          )
        };

        return result;
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
    },
    unFollowArtist: async (followerId: ObjectID, followedId: string): Promise<boolean> => {
      const followedObjId = new ObjectID(followedId);
      try {
        return aDal.unFollowArtist(followerId, followedObjId);
      } catch (error) {
        errorLogger('artist service : ' + error);
        throw error;
      }
    }
  };
};
