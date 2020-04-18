import { MongoClient, Db } from 'mongodb';
import { errorLogger, infoLogger } from '../logger';
require('dotenv').config();

interface DbConnectionReturnType {
  getDb: (dal?: string) => Promise<Db>;
}

export const dbConnector = ((): DbConnectionReturnType => {
  let client: MongoClient;
  const urlDB = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`;
  const dbName = `${process.env.DB_NAME}`;
  const connectDB = async (): Promise<MongoClient> => {
    try {
      const client = await MongoClient.connect(urlDB, { useUnifiedTopology: true });
      return client;
    } catch (err) {
      errorLogger(err);
      return err;
    }
  };

  const getDb = async (dal = ''): Promise<Db> => {
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
