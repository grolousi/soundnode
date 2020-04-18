import { Readable } from 'stream';
import { dbConnector } from '../db-connector';
import { AddTrackInfosReturnType, TrackInfosType } from '../../shared/types/tracks.types';
import {
  GridFSBucketWriteStream,
  GridFSBucketReadStream,
  InsertOneWriteOpResult,
  Db,
  ObjectID,
  GridFSBucket
} from 'mongodb';
import { errorLogger } from '../../logger';

const collection = 'trackInfos';

interface TrackDalReturnType {
  getTrackReadStream: (trackId: ObjectID) => GridFSBucketReadStream;
  uploadTrack: (
    readableTrackStream: Readable,
    file: Express.Multer.File,
    title: string
  ) => GridFSBucketWriteStream;
  addTrackInfos: (
    id,
    ttrackInfos: TrackInfosType
  ) => Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>>;
}

export const tracksDal = async (): Promise<TrackDalReturnType> => {
  const db: Db = await dbConnector.getDb('tracks');

  const getTrackReadStream = (trackId: ObjectID): GridFSBucketReadStream => {
    try {
      const bucket = new GridFSBucket(db, {
        bucketName: 'tracks'
      });

      const downloadStream = bucket.openDownloadStream(trackId);

      return downloadStream;
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const uploadTrack = (
    readableTrackStream: Readable,
    file: Express.Multer.File,
    title: string
  ): GridFSBucketWriteStream => {
    try {
      readableTrackStream.push(file.buffer);

      const bucket = new GridFSBucket(db, {
        bucketName: 'tracks'
      });

      const uploadStream = bucket.openUploadStream(title);

      readableTrackStream.pipe(uploadStream);
      readableTrackStream.push(null);
      return uploadStream;
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const addTrackInfos = (
    id,
    trackInfos: TrackInfosType
  ): Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>> => {
    try {
      return db.collection(collection).insertOne({ trackId: id, ...trackInfos });
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  return {
    getTrackReadStream,
    uploadTrack,
    addTrackInfos
  };
};
