import { ObjectID } from 'mongodb';

export interface AddCommentReturnType {
  _id: ObjectID;
  artistId: ObjectID;
  text: string;
}

export interface CommentType {
  _id: ObjectID;
  artistId: ObjectID;
  text: string;
}

export interface PopulatedCommentType {
  _id: ObjectID;
  artistName: string;
  artistId: ObjectID;
  text: string;
}
