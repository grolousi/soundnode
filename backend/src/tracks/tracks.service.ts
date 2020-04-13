import {
  GridFSBucketReadStream,
  GridFSBucketWriteStream,
  InsertOneWriteOpResult,
  ObjectID,
  UpdateWriteOpResult
} from 'mongodb';
import { Readable } from 'stream';
import { AddTrackInfosReturnType } from '../shared/types/tracks.types';
import { tracksDal } from '../database/data-access/tracks.dal';
import { userDal } from '../database/data-access/user.dal';
import { ArtistDal } from '../database/data-access/artist.dal';
import { errorLogger } from '../logger';

interface TracksServiceReturnType {
  getTrackReadStream: (trackId: ObjectID) => GridFSBucketReadStream;
  uploadTrack: (
    readableTrackStream: Readable,
    req: Express.Multer.File,
    trackName: string
  ) => GridFSBucketWriteStream;
  addTrackInfos: (id, trackName: string) => Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>>;
  addTrackToArtist: (userId: ObjectID, trackInfosId: ObjectID) => Promise<UpdateWriteOpResult>;
}

export const tracksService = async (): Promise<TracksServiceReturnType> => {
  const tDal = await tracksDal();
  const uDal = await userDal();
  const aDal = await ArtistDal();
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
      }
    }
  };
};
