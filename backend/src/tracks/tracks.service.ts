import { GridFSBucketReadStream, GridFSBucketWriteStream, InsertOneWriteOpResult, ObjectID } from 'mongodb';
import { Readable } from 'stream';
import { AddTrackInfosReturnType } from '../shared/types/tracks.types';
import { tracksDal } from '../database/data-access/tracks.dal';

interface TracksServiceReturnType {
  getTrackReadStream: (trackId: ObjectID) => GridFSBucketReadStream;
  uploadTrack: (
    readableTrackStream: Readable,
    req: Express.Multer.File,
    trackName: string
  ) => GridFSBucketWriteStream;
  addTrackInfos: (id, trackName: string) => Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>>;
}

export const tracksService = async (): Promise<TracksServiceReturnType> => {
  const tDal = await tracksDal();
  return {
    getTrackReadStream: tDal.getTrackReadStream,
    uploadTrack: tDal.uploadTrack,
    addTrackInfos: tDal.addTrackInfos
  };
};
