import { dbConnector } from '../db-connector';
import { InsertOneWriteOpResult, Db, ObjectID, UpdateWriteOpResult, ObjectId } from 'mongodb';
import {
  ArtistType,
  ArtistCreationType,
  PopulatedArtistType,
  ArtistUpdateType
} from '../../shared/types/artist.types';
import { errorLogger } from '../../logger';

const collection = 'artists';

interface ArtistDalReturnType {
  createArtist: (name: string) => Promise<InsertOneWriteOpResult<ArtistType>>;
  editArtist: (artitstId: ObjectID, body: ArtistUpdateType) => Promise<UpdateWriteOpResult>;
  addTrackInfosToArtist: (trackInfosId: ObjectID, artistId: ObjectID) => Promise<UpdateWriteOpResult>;
  getArtist: (artistId: ObjectID) => Promise<ArtistType>;
  getArtistName: (artistId: ObjectID) => Promise<string>;
  getArtistWithComments: (artistId: ObjectID) => Promise<PopulatedArtistType[]>;
  getAllArtists: () => Promise<ArtistType[]>;
  followArtist: (followerId: ObjectID, followedId: ObjectID) => Promise<boolean>;
  unFollowArtist: (followerId: ObjectID, followedId: ObjectID) => Promise<boolean>;
  addLikeToArtist: (artistId: ObjectID, trackId: ObjectID) => Promise<boolean>;
  removeLikeToArtist: (artistId: ObjectID, trackId: ObjectID) => Promise<boolean>;
  addCommentToArtist: (artistId: ObjectID, commentId: ObjectID) => Promise<boolean>;
}

export const artistDal = async (): Promise<ArtistDalReturnType> => {
  const db: Db = await dbConnector.getDb('artists');

  const createArtist = async (name: string): Promise<InsertOneWriteOpResult<ArtistType>> => {
    const artists: ArtistCreationType = {
      name,
      tracks: [],
      followers: [],
      follows: [],
      likes: [],
      comments: []
    };
    try {
      return db.collection(collection).insertOne(artists);
    } catch (error) {
      errorLogger(error);
      throw error;
    }
  };

  const editArtist = async (artitstId: ObjectID, body: ArtistUpdateType): Promise<UpdateWriteOpResult> => {
    try {
      return db.collection(collection).updateOne({ _id: artitstId }, { $set: { ...body } });
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

  const getArtistWithComments = (artistId: ObjectID): Promise<PopulatedArtistType[]> => {
    try {
      return db
        .collection(collection)
        .aggregate<PopulatedArtistType>([
          { $match: { _id: artistId } },
          {
            $lookup: {
              from: 'trackInfos',
              localField: 'tracks',
              foreignField: '_id',
              as: 'tracks'
            }
          },
          { $project: { _id: 1, name: 1, tracks: 1, followers: 1 } }
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
  const getArtistName = async (artistId: ObjectID): Promise<string> => {
    try {
      const result = await db
        .collection(collection)
        .findOne<{ name: string }>({ _id: artistId }, { projection: { name: 1, _id: 0 } });
      return result.name;
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

  const followArtist = async (followerId: ObjectId, followedId: ObjectId): Promise<boolean> => {
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

  const unFollowArtist = async (followerId: ObjectID, followedId: ObjectID): Promise<boolean> => {
    try {
      await db.collection(collection).updateOne({ _id: followedId }, { $unset: { followers: followerId } });
      await db.collection(collection).updateOne({ _id: followerId }, { $unset: { follows: followedId } });

      return true;
    } catch (error) {
      errorLogger('artist dal : ' + error);
      throw error;
    }
  };

  const addLikeToArtist = async (artistId: ObjectID, trackId: ObjectID): Promise<boolean> => {
    try {
      await db.collection(collection).updateOne({ _id: artistId }, { $addToSet: { likes: trackId } });
      return true;
    } catch (error) {
      errorLogger('artist dal : ' + error);
      throw error;
    }
  };
  const removeLikeToArtist = async (artistId: ObjectID, trackId: ObjectID): Promise<boolean> => {
    try {
      await db.collection(collection).updateOne({ _id: artistId }, { $unset: { likes: trackId } });
      return true;
    } catch (error) {
      errorLogger('artist dal : ' + error);
      throw error;
    }
  };

  const addCommentToArtist = async (artistId: ObjectID, commentId: ObjectID): Promise<boolean> => {
    try {
      await db.collection(collection).updateOne({ _id: artistId }, { $addToSet: { comments: commentId } });
      return true;
    } catch (error) {
      errorLogger('artist dal : ' + error);
      throw error;
    }
  };

  return {
    createArtist,
    editArtist,
    addTrackInfosToArtist,
    getArtist,
    getArtistName,
    getArtistWithComments,
    getAllArtists,
    followArtist,
    unFollowArtist,
    addLikeToArtist,
    removeLikeToArtist,
    addCommentToArtist
  };
};
