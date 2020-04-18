import { ObjectID } from 'mongodb';

export interface UserType {
  _id: ObjectID;
  email: string;
  artistId: ObjectID;
  userName: string;
  password?: string;
}

export interface CreateUserReturnType {
  artistId: ObjectID;
  userId: ObjectID;
}
