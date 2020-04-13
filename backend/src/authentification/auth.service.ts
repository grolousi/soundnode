import { userDal } from '../database/data-access/user.dal';
import { UserType } from '../types/user.types';
import { InsertOneWriteOpResult } from 'mongodb';

interface AuthServiceReturnType {
  getUserByEmail: (email: string) => Promise<UserType>;
  createUser: (user: UserType) => Promise<InsertOneWriteOpResult<UserType>>;
}

export const authService = async (): Promise<AuthServiceReturnType> => {
  const uDal = await userDal();
  return {
    getUserByEmail: (email: string): Promise<UserType> => uDal.getUserByEmail(email),
    createUser: (user: UserType): Promise<InsertOneWriteOpResult<UserType>> => uDal.createUser(user)
  };
};
