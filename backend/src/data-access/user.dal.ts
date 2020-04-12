import * as mongodb from 'mongodb';
import { dbConnector } from '../database/db-connector';
import { UserType } from '../types/user.types';

const usersCollection = 'users';

interface UserDalReturnType {
  getUser: (email: string, shouldReturnPassword?: boolean) => Promise<UserType>;
  createUser: (user: UserType) => Promise<mongodb.InsertOneWriteOpResult<UserType>>;
}

export const userDal = async (): Promise<UserDalReturnType> => {
  const db: mongodb.Db = await dbConnector.getDb();

  const getUser = async (email: string, shouldReturnPassword = false): Promise<UserType> => {
    return db.collection(usersCollection).findOne(
      {
        email
      },
      { projection: { password: shouldReturnPassword ? 1 : 0, email: 1 } }
    );
  };

  const createUser = async (user: UserType): Promise<mongodb.InsertOneWriteOpResult<UserType>> => {
    return db.collection(usersCollection).insertOne(user);
  };

  return {
    getUser,
    createUser
  };
};
