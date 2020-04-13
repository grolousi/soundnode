import { dbConnector } from '../db-connector';
import { UserType } from '../../shared/types/user.types';
import { InsertOneWriteOpResult, Db } from 'mongodb';

const usersCollection = 'users';

interface UserDalReturnType {
  getUserByEmail: (email: string) => Promise<UserType>;

  createUser: (user: UserType) => Promise<InsertOneWriteOpResult<UserType>>;
}

export const userDal = async (): Promise<UserDalReturnType> => {
  const db: Db = await dbConnector.getDb('user');

  const getUserByEmail = async (email: string): Promise<UserType> => {
    return db.collection(usersCollection).findOne({
      email
    });
  };

  const createUser = async (user: UserType): Promise<InsertOneWriteOpResult<UserType>> => {
    return db.collection(usersCollection).insertOne(user);
  };

  return {
    getUserByEmail,
    createUser
  };
};
