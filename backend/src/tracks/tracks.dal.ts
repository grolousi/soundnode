import * as mongodb from 'mongodb';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import { DbConnection } from '../database/db-connector';
const ObjectID = mongodb.ObjectID;

const trackInfosCollectionName = 'trackInfos';

interface AddTrackInfosReturnType {
  _id: mongodb.ObjectID;
  trackId;
  trackName: string;
}

interface TrackDalReturnType {
  getTrackReadStream: (
    req: Request,
    res: Response
  ) => mongodb.GridFSBucketReadStream;
  uploadTrack: (
    readableTrackStream: Readable,
    req: Request,
    trackName: string
  ) => mongodb.GridFSBucketWriteStream;
  addTrackInfos: (
    id,
    trackName: string
  ) => Promise<mongodb.InsertOneWriteOpResult<AddTrackInfosReturnType>>;
}

export const tracksDal = async (): Promise<TrackDalReturnType> => {
  const db: mongodb.Db = await DbConnection().getDb();

  const getTrackReadStream = (
    req: Request,
    res: Response
  ): mongodb.GridFSBucketReadStream => {
    let trackId: mongodb.ObjectID;

    try {
      trackId = new ObjectID(req.params.trackId);
    } catch (err) {
      res.status(400).json({ message: 'Invalid trackId in URL parameter.' });
    }

    const bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'tracks'
    });

    const downloadStream = bucket.openDownloadStream(trackId);

    return downloadStream;
  };

  const uploadTrack = (
    readableTrackStream: Readable,
    req: Request,
    trackName: string
  ): mongodb.GridFSBucketWriteStream => {
    readableTrackStream.push(req.file.buffer);

    const bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'tracks'
    });

    const uploadStream = bucket.openUploadStream(trackName);

    readableTrackStream.pipe(uploadStream);
    readableTrackStream.push(null);
    return uploadStream;
  };

  const addTrackInfos = (
    id,
    trackName: string
  ): Promise<mongodb.InsertOneWriteOpResult<AddTrackInfosReturnType>> => {
    return db
      .collection(trackInfosCollectionName)
      .insertOne({ trackId: id, trackName });
  };

  return {
    getTrackReadStream,
    uploadTrack,
    addTrackInfos
  };
};
