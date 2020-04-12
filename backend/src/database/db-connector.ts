import * as mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;

const urlDB = 'mongodb://localhost:27017';
const dbName = 'trackDb';

interface DbConnectionReturnType {
  getDb: () => Promise<mongodb.Db>;
}

export const dbConnector = ((): DbConnectionReturnType => {
  let client: mongodb.MongoClient;
  const connectDB = async (): Promise<mongodb.MongoClient> => {
    try {
      const client = await MongoClient.connect(urlDB, { useUnifiedTopology: true });
      return client;
    } catch (err) {
      return err;
    }
  };

  const getDb = async (): Promise<mongodb.Db> => {
    if (client) {
      console.log(`db connection is already alive`);
    } else {
      console.log(`getting new db connection`);
      client = await connectDB();
      return client.db(dbName);
    }
  };

  return {
    getDb
  };
})();
