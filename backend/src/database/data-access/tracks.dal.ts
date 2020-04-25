import { Readable } from 'stream';
import { dbConnector } from '../db-connector';
import {
  AddTrackInfosReturnType,
  TrackInfosType,
  UpdateTrackInfoType
} from '../../shared/types/tracks.types';
import {
  GridFSBucketWriteStream,
  GridFSBucketReadStream,
  InsertOneWriteOpResult,
  Db,
  ObjectID,
  GridFSBucket,
  UpdateWriteOpResult
} from 'mongodb';
import { errorLogger } from '../../logger';
import { of } from 'ramda';

const collection = 'trackInfos';

interface TrackDalReturnType {
  getTrackReadStream: (trackId: ObjectID) => GridFSBucketReadStream;
  uploadTrack: (
    readableTrackStream: Readable,
    file: Express.Multer.File,
    title: string
  ) => GridFSBucketWriteStream;
  deleteTrack: (
    readableTrackStream: Readable,
    trackInfoId: ObjectID
  ) => Promise<{ status: boolean; message: string }>;
  editTrackInfos: (trackInfoId: ObjectID, updatedInfo: UpdateTrackInfoType) => Promise<UpdateWriteOpResult>;
  addTrackInfos: (
    id,
    ttrackInfos: TrackInfosType
  ) => Promise<InsertOneWriteOpResult<AddTrackInfosReturnType>>;
  incrementLikes: (trackId: ObjectID) => Promise<boolean>;
  decrementLikes: (trackId: ObjectID) => Promise<boolean>;
  addCommentToTrack: (trackId: ObjectID, commentId: ObjectID) => Promise<boolean>;
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

  const deleteTrack = async (
    readableTrackStream: Readable,
    trackInfoId: ObjectID
  ): Promise<{ status: boolean; message: string }> => {
    try {
      const bucket = new GridFSBucket(db, {
        bucketName: 'tracks'
      });
      const trackInfos = await db.collection(collection).findOne<TrackInfosType>({ _id: trackInfoId });
      if (!trackInfos) {
        return { status: false, message: "Track doesn't exist" };
      }
      const { title, trackId } = trackInfos;
      await db.collection(collection).deleteOne({ _id: trackInfoId });
      const uploadStream = bucket.openUploadStream(title);
      readableTrackStream.pipe(uploadStream);
      readableTrackStream.push(null);
      uploadStream.once('finish', () => {
        bucket.delete(trackId, (error) => {
          if (error) {
            errorLogger(error.message);
            throw error;
          }
        });
      });
      return { status: true, message: '' };
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const editTrackInfos = async (
    trackInfoId: ObjectID,
    updatedInfo: UpdateTrackInfoType
  ): Promise<UpdateWriteOpResult> => {
    const trackInfo = await db.collection(collection).findOne<TrackInfosType>({ _id: trackInfoId });
    try {
      if (updatedInfo.title) {
        const bucket = new GridFSBucket(db, {
          bucketName: 'tracks'
        });
        bucket.rename(trackInfo.trackId, updatedInfo.title, (error) => {
          if (error) {
            errorLogger(error.message);
            throw error;
          }
        });
      }
      return db.collection(collection).updateOne({ _id: trackInfoId }, { $set: { ...updatedInfo } });
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

  const incrementLikes = async (trackId: ObjectID): Promise<boolean> => {
    try {
      await db.collection(collection).updateOne({ _id: trackId }, { $inc: { likes: 1 } });
      return true;
    } catch (error) {
      errorLogger('track dal : ' + error);
      throw error;
    }
  };

  const decrementLikes = async (trackId: ObjectID): Promise<boolean> => {
    try {
      await db.collection(collection).updateOne({ _id: trackId }, { $inc: { likes: -1 } });
      return true;
    } catch (error) {
      errorLogger('track dal : ' + error);
      throw error;
    }
  };

  const addCommentToTrack = async (trackId: ObjectID, commentId: ObjectID): Promise<boolean> => {
    try {
      await db.collection(collection).updateOne({ _id: trackId }, { $addToSet: { comments: commentId } });
      return true;
    } catch (error) {
      errorLogger('track dal : ' + error);
      throw error;
    }
  };

  return {
    getTrackReadStream,
    uploadTrack,
    deleteTrack,
    editTrackInfos,
    addTrackInfos,
    incrementLikes,
    decrementLikes,
    addCommentToTrack
  };
};
