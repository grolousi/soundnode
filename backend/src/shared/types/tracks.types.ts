import { ObjectID } from 'mongodb';

export interface AddTrackInfosReturnType {
  _id: ObjectID;
  trackId;
  trackName: string;
}
