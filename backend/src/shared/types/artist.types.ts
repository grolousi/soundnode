import { ObjectID } from 'mongodb';

export interface ArtistType {
  _id: ObjectID;
  name: string;
  tracks: ObjectID[];
  followers: ObjectID[];
  follows: ObjectID[];
}

export interface ArtistCreationType {
  name: string;
  tracks: ObjectID[];
  followers: ObjectID[];
  follows: ObjectID[];
}
