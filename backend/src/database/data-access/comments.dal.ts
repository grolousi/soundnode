import { dbConnector } from '../db-connector';
import { errorLogger } from '../../logger';
import { Db, InsertOneWriteOpResult, ObjectID } from 'mongodb';
import { AddCommentReturnType, CommentType } from '../../shared/types/comment.types';

interface TracksControllerReturnType {
  createComments: (text: string, artistId: ObjectID) => Promise<InsertOneWriteOpResult<AddCommentReturnType>>;
  getComment: (commentId: ObjectID) => Promise<CommentType>;
}
const collection = 'comments';
export const commentDal = async (): Promise<TracksControllerReturnType> => {
  const db: Db = await dbConnector.getDb('tracks');
  const createComments = async (
    text: string,
    artistId: ObjectID
  ): Promise<InsertOneWriteOpResult<AddCommentReturnType>> => {
    try {
      return await db.collection(collection).insertOne({ text, artistId: artistId });
    } catch (error) {
      errorLogger('track dal : ' + error);
      throw error;
    }
  };

  const getComment = async (commentId: ObjectID): Promise<CommentType> => {
    try {
      return await db.collection(collection).findOne({ _id: commentId });
    } catch (error) {
      errorLogger('track dal : ' + error);
      throw error;
    }
  };

  return {
    createComments,
    getComment
  };
};
