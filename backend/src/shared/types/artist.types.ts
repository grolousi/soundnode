import { ObjectID } from 'mongodb';

export interface ArtistType {
  _id: ObjectID;
  tracks: ObjectID[];
  followers: ObjectID[];
  follows: ObjectID[];
}

export interface ArtistCreationType {
  tracks: ObjectID[];
  followers: ObjectID[];
  follows: ObjectID[];
}
