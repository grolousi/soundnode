import * as mongodb from 'mongodb';
import { errorLogger, infoLogger } from '../logger';
const MongoClient = mongodb.MongoClient;

const urlDB = 'mongodb://localhost:27017';
const dbName = 'trackDb';

interface DbConnectionReturnType {
  getDb: (dal?: string) => Promise<mongodb.Db>;
}

export const dbConnector = ((): DbConnectionReturnType => {
  let client: mongodb.MongoClient;
  const connectDB = async (): Promise<mongodb.MongoClient> => {
    try {
      const client = await MongoClient.connect(urlDB, { useUnifiedTopology: true });
      return client;
    } catch (err) {
      errorLogger(err);
      return err;
    }
  };

  const getDb = async (dal = ''): Promise<mongodb.Db> => {
    if (client) {
      infoLogger(`Db connection is already alive ${dal ? dal : ''}`);
      return client.db(dbName);
    } else {
      infoLogger(`Getting new db connection ${dal ? dal : ''}`);
      client = await connectDB();
      return client.db(dbName);
    }
  };

  return {
    getDb
  };
})();
