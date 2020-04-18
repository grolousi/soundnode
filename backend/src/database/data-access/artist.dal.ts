import { dbConnector } from '../db-connector';
import { InsertOneWriteOpResult, Db, ObjectID, UpdateWriteOpResult } from 'mongodb';
import { ArtistType, ArtistCreationType } from '../../shared/types/artist.types';
import { errorLogger } from '../../logger';

const collection = 'artists';

interface ArtistDalReturnType {
  createArtist: (name: string) => Promise<InsertOneWriteOpResult<ArtistType>>;
  addTrackInfosToArtist: (trackInfosId: ObjectID, artistId: ObjectID) => Promise<UpdateWriteOpResult>;
  getArtist: (artistId: ObjectID) => Promise<ArtistType>;
  getArtistWithComments: (artistId: ObjectID) => Promise<ArtistType[]>;
  getAllArtists: () => Promise<ArtistType[]>;
  followArtist: (followerId: ObjectID, followedId: ObjectID) => Promise<boolean>;
}

export const artistDal = async (): Promise<ArtistDalReturnType> => {
  const db: Db = await dbConnector.getDb('artists');

  const createArtist = async (name: string): Promise<InsertOneWriteOpResult<ArtistType>> => {
    const artists: ArtistCreationType = {
      name,
      tracks: [],
      followers: [],
      follows: []
    };
    try {
      return db.collection(collection).insertOne(artists);
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const addTrackInfosToArtist = (
    trackInfosId: ObjectID,
    artistId: ObjectID
  ): Promise<UpdateWriteOpResult> => {
    try {
      return db.collection(collection).updateOne({ _id: artistId }, { $push: { tracks: trackInfosId } });
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const getArtistWithComments = (artistId: ObjectID): Promise<ArtistType[]> => {
    try {
      return db
        .collection(collection)
        .aggregate<ArtistType>([
          { $match: { _id: artistId } },
          {
            $lookup: {
              from: 'trackInfos',
              localField: 'tracks',
              foreignField: '_id',
              as: 'tracks'
            }
          }
        ])
        .toArray();
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const getArtist = (artistId: ObjectID): Promise<ArtistType> => {
    try {
      return db.collection(collection).findOne({ _id: artistId });
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const getAllArtists = (): Promise<ArtistType[]> => {
    try {
      return db.collection(collection).aggregate<ArtistType>([]).toArray();
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const followArtist = async (followerId: ObjectID, followedId: ObjectID): Promise<boolean> => {
    try {
      await db
        .collection(collection)
        .updateOne({ _id: followedId }, { $addToSet: { followers: followerId } });
      await db.collection(collection).updateOne({ _id: followerId }, { $addToSet: { follows: followedId } });
      return true;
    } catch (error) {
      errorLogger('artist dal : ' + error);
      throw error;
    }
  };

  return {
    createArtist,
    addTrackInfosToArtist,
    getArtist,
    getArtistWithComments,
    getAllArtists,
    followArtist
  };
};
