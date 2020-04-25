import { ObjectID } from 'mongodb';

export const getCreationDate = (id: ObjectID): Date => {
  return id.getTimestamp();
};
