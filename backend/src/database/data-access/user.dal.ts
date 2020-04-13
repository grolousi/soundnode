import { dbConnector } from '../db-connector';
import { UserType } from '../../shared/types/user.types';
import { InsertOneWriteOpResult, Db, ObjectID } from 'mongodb';

const collection = 'users';

interface UserDalReturnType {
  getUserByEmail: (email: string) => Promise<UserType>;
  getUserByUserName: (userName: string) => Promise<UserType>;
  createUser: (user: UserType) => Promise<InsertOneWriteOpResult<UserType>>;
  getUserById: (id: ObjectID) => Promise<UserType>;
}

export const userDal = async (): Promise<UserDalReturnType> => {
  const db: Db = await dbConnector.getDb('user');

  const getUserByEmail = async (email: string): Promise<UserType> => {
    return db.collection(collection).findOne({
      email
    });
  };
  const getUserByUserName = async (userName: string): Promise<UserType> => {
    return db.collection(collection).findOne({
      userName
    });
  };

  const getUserById = async (id: ObjectID): Promise<UserType> => {
    return db.collection(collection).findOne({ _id: id });
  };

  const createUser = async (user: UserType): Promise<InsertOneWriteOpResult<UserType>> => {
    return db.collection(collection).insertOne(user);
  };

  return {
    getUserByEmail,
    getUserByUserName,
    getUserById,
    createUser
  };
};
