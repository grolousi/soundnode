import {
  GridFSBucketReadStream,
  GridFSBucketWriteStream,
  InsertOneWriteOpResult,
  ObjectID,
  UpdateWriteOpResult
} from 'mongodb';
import { Readable } from 'stream';
import { AddTrackInfosReturnType, TrackInfosType } from '../shared/types/tracks.types';
import { tracksDal } from '../database/data-access/tracks.dal';
import { userDal } from '../database/data-access/user.dal';
import { artistDal } from '../database/data-access/artist.dal';
import { errorLogger } from '../logger';
import { commentDal } from '../database/data-access/comments.dal';

interface TracksServiceReturnType {
  getTrackReadStream: (trackId: ObjectID) => GridFSBucketReadStream;
  uploadTrack: (
    readableTrackStream: Readable,
    req: Express.Multer.File,
    title: string
  ) => GridFSBucketWriteStream;
  addTrackInfos: (id, trackInfos: TrackInfosType) => Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>>;
  addTrackToArtist: (userId: ObjectID, trackInfosId: ObjectID) => Promise<UpdateWriteOpResult>;
  likeTrack: (artistId: ObjectID, trackInfosId: ObjectID) => Promise<{ status: boolean; message: string }>;
  unlikeTrack: (artistId: ObjectID, trackInfosId: ObjectID) => Promise<{ status: boolean; message: string }>;
  addCommentToTrack: (artistId: ObjectID, comment: string, trackId: ObjectID) => Promise<boolean>;
}

export const tracksService = async (): Promise<TracksServiceReturnType> => {
  const tDal = await tracksDal();
  const uDal = await userDal();
  const aDal = await artistDal();
  const cDal = await commentDal();
  return {
    getTrackReadStream: tDal.getTrackReadStream,
    uploadTrack: tDal.uploadTrack,
    addTrackInfos: tDal.addTrackInfos,
    addTrackToArtist: async (userId: ObjectID, trackInfosId: ObjectID): Promise<UpdateWriteOpResult> => {
      try {
        const user = await uDal.getUserById(userId);
        const artistId = user.artistId;
        return aDal.addTrackInfosToArtist(trackInfosId, artistId);
      } catch (error) {
        errorLogger('track.service' + error);
        throw error;
      }
    },
    likeTrack: async (
      artistId: ObjectID,
      trackInfosId: ObjectID
    ): Promise<{ status: boolean; message: string }> => {
      try {
        const artist = await aDal.getArtist(artistId);
        if (artist.tracks?.some((t: ObjectID) => t.equals(trackInfosId))) {
          return { status: false, message: "Can't like your own track" };
        }
        if (artist.likes?.some((t: ObjectID) => t.equals(trackInfosId))) {
          return { status: false, message: 'Already liked this track' };
        }
        await aDal.addLikeToArtist(artistId, trackInfosId);
        await tDal.incrementLikes(trackInfosId);
        return { status: true, message: '' };
      } catch (error) {
        errorLogger('track.service : ' + error);
        throw error;
      }
    },
    unlikeTrack: async (
      artistId: ObjectID,
      trackInfosId: ObjectID
    ): Promise<{ status: boolean; message: string }> => {
      try {
        const artist = await aDal.getArtist(artistId);
        if (!artist.likes?.some((t: ObjectID) => t.equals(trackInfosId))) {
          return { status: false, message: "Cannot unlike if you didn't liked it before" };
        }
        await aDal.removeLikeToArtist(artistId, trackInfosId);
        await tDal.decrementLikes(trackInfosId);
        return { status: true, message: '' };
      } catch (error) {
        errorLogger('track.service : ' + error);
        throw error;
      }
    },
    addCommentToTrack: async (artistId: ObjectID, comment: string, trackId: ObjectID): Promise<boolean> => {
      try {
        const result = await cDal.createComments(comment, artistId);
        await aDal.addCommentToArtist(artistId, result.insertedId);
        await tDal.addCommentToTrack(trackId, result.insertedId);
        return true;
      } catch (error) {
        errorLogger('track.service : ' + error);
        throw error;
      }
    }
  };
};
