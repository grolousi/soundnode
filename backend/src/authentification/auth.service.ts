import { userDal } from '../database/data-access/user.dal';
import { UserType, CreateUserReturnType } from '../shared/types/user.types';
import { artistDal } from '../database/data-access/artist.dal';
import { errorLogger } from '../logger';

interface AuthServiceReturnType {
  getUserByEmail: (email: string) => Promise<UserType>;
  getUserByUserName: (userName: string) => Promise<UserType>;
  createUser: (user: UserType) => Promise<CreateUserReturnType>;
}

export const authService = async (): Promise<AuthServiceReturnType> => {
  const uDal = await userDal();
  const aDal = await artistDal();

  return {
    getUserByEmail: (email: string): Promise<UserType> => uDal.getUserByEmail(email),
    getUserByUserName: (userName: string): Promise<UserType> => uDal.getUserByUserName(userName),
    createUser: async (user: UserType): Promise<CreateUserReturnType> => {
      try {
        const artistResultresult = await aDal.createArtist(user.userName);
        const userResult = await uDal.createUser({ ...user, artistId: artistResultresult.insertedId });
        return { artistId: artistResultresult.insertedId, userId: userResult.insertedId };
      } catch (error) {
        errorLogger(error);
        throw error;
      }
    }
  };
};
