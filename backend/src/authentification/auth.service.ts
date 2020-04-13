import { userDal } from '../database/data-access/user.dal';
import { UserType } from '../shared/types/user.types';
import { InsertOneWriteOpResult } from 'mongodb';
import { ArtistDal } from '../database/data-access/artist.dal';

interface AuthServiceReturnType {
  getUserByEmail: (email: string) => Promise<UserType>;
  getUserByUserName: (userName: string) => Promise<UserType>;
  createUser: (user: UserType) => Promise<InsertOneWriteOpResult<UserType>>;
}

export const authService = async (): Promise<AuthServiceReturnType> => {
  const uDal = await userDal();
  const aDal = await ArtistDal();
  return {
    getUserByEmail: (email: string): Promise<UserType> => uDal.getUserByEmail(email),
    getUserByUserName: (userName: string): Promise<UserType> => uDal.getUserByUserName(userName),
    createUser: async (user: UserType): Promise<InsertOneWriteOpResult<UserType>> => {
      const result = await aDal.createArtist();

      return await uDal.createUser({ ...user, artistId: result.insertedId });
    }
  };
};
