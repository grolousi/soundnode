import { ObjectID } from 'mongodb';
import { PopulatedCommentType } from './comment.types';

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

export interface PopulatedTrackInfosTYpe {
  _id: ObjectID;
  trackId;
  title: string;
  description?: string;
  cover?: string;
  likes?: number;
  comments?: PopulatedCommentType[];
}

export interface UpdateTrackInfoType {
  title?: string;
  description?: string;
  cover?: string;
}
