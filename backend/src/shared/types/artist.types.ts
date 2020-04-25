import { ObjectID } from 'mongodb';
import { PopulatedTrackInfosTYpe, AddTrackInfosReturnType } from './tracks.types';

export interface ArtistType {
  _id: ObjectID;
  name: string;
  tracks: ObjectID[];
  followers: ObjectID[];
  follows: ObjectID[];
  likes: ObjectID[];
  comments: ObjectID[];
}

export interface ArtistCreationType {
  name: string;
  tracks: ObjectID[];
  followers: ObjectID[];
  follows: ObjectID[];
  likes: ObjectID[];
  comments: ObjectID[];
}

export interface PopulatedArtistType {
  _id: ObjectID;
  name: string;
  tracks: AddTrackInfosReturnType[];
  followers: ObjectID[];
}

export interface PopulatedArtistTypeWPopulatedTracks {
  _id: ObjectID;
  name: string;
  tracks: PopulatedTrackInfosTYpe[];
  followers: FollowerReturnType[];
}

export interface FollowerReturnType {
  followerId: ObjectID;
  name: string;
}

export interface ArtistUpdateType {
  name?: string;
  description?: string;
}
