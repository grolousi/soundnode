import { Readable } from 'stream';
import { dbConnector } from '../db-connector';
import { AddTrackInfosReturnType } from '../../shared/types/tracks.types';
import {
  GridFSBucketWriteStream,
  GridFSBucketReadStream,
  InsertOneWriteOpResult,
  Db,
  ObjectID,
  GridFSBucket
} from 'mongodb';

const trackInfosCollectionName = 'trackInfos';

interface TrackDalReturnType {
  getTrackReadStream: (trackId: ObjectID) => GridFSBucketReadStream;
  uploadTrack: (
    readableTrackStream: Readable,
    file: Express.Multer.File,
    trackName: string
  ) => GridFSBucketWriteStream;
  addTrackInfos: (id, trackName: string) => Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>>;
}

export const tracksDal = async (): Promise<TrackDalReturnType> => {
  const db: Db = await dbConnector.getDb('tracks');

  const getTrackReadStream = (trackId: ObjectID): GridFSBucketReadStream => {
    const bucket = new GridFSBucket(db, {
      bucketName: 'tracks'
    });

    const downloadStream = bucket.openDownloadStream(trackId);

    return downloadStream;
  };

  const uploadTrack = (
    readableTrackStream: Readable,
    file: Express.Multer.File,
    trackName: string
  ): GridFSBucketWriteStream => {
    readableTrackStream.push(file.buffer);

    const bucket = new GridFSBucket(db, {
      bucketName: 'tracks'
    });

    const uploadStream = bucket.openUploadStream(trackName);

    readableTrackStream.pipe(uploadStream);
    readableTrackStream.push(null);
    return uploadStream;
  };

  const addTrackInfos = (id, trackName: string): Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>> => {
    return db.collection(trackInfosCollectionName).insertOne({ trackId: id, trackName });
  };

  return {
    getTrackReadStream,
    uploadTrack,
    addTrackInfos
  };
};
