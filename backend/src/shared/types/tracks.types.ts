import { ObjectID } from 'mongodb';

export interface AddTrackInfosReturnType {
  _id: ObjectID;
  trackId;
  title: string;
  description?: string;
  image?: string;
  likes?: number;
  comments?: ObjectID[];
}

export interface TrackInfosType {
  trackId;
  title: string;
  description?: string;
  image?: string;
  likes?: number;
  comments?: ObjectID[];
}
