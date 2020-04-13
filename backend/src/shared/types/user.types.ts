import { ObjectID } from 'mongodb';

export interface UserType {
  _id: ObjectID;
  email: string;
  password?: string;
}
