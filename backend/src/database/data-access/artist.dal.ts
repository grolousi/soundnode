import { dbConnector } from '../db-connector';
import { InsertOneWriteOpResult, Db, ObjectID, UpdateWriteOpResult } from 'mongodb';
import { ArtistType, ArtistCreationType } from '../../shared/types/artist.types';

const collection = 'artists';

interface ArtistDalReturnType {
  createArtist: () => Promise<InsertOneWriteOpResult<ArtistType>>;
  addTrackInfosToArtist: (trackInfosId: ObjectID, artistId: ObjectID) => Promise<UpdateWriteOpResult>;
}

export const ArtistDal = async (): Promise<ArtistDalReturnType> => {
  const db: Db = await dbConnector.getDb('artists');

  const createArtist = async (): Promise<InsertOneWriteOpResult<ArtistType>> => {
    const artists: ArtistCreationType = {
      tracks: [],
      followers: [],
      follows: []
    };
    return db.collection(collection).insertOne(artists);
  };

  const addTrackInfosToArtist = (
    trackInfosId: ObjectID,
    artistId: ObjectID
  ): Promise<UpdateWriteOpResult> => {
    return db.collection(collection).updateOne({ _id: artistId }, { $push: { tracks: trackInfosId } });
  };

  return {
    createArtist,
    addTrackInfosToArtist
  };
};
