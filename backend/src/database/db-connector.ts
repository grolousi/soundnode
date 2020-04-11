import * as mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;

const urlDB = 'mongodb://localhost:27017';
const dbName = 'trackDb';

interface DbConnectionType {
  getDb: () => Promise<mongodb.Db>;
}

export const DbConnection = (): DbConnectionType => {
  let db: mongodb.Db = null;
  const connectDB = async (): Promise<mongodb.Db> => {
    try {
      const client = await MongoClient.connect(urlDB);
      return client.db(dbName);
    } catch (err) {
      return err;
    }
  };

  const getDb = async (): Promise<mongodb.Db> => {
    if (db !== null) {
      console.log(`db connection is already alive`);
      return db;
    } else {
      console.log(`getting new db connection`);
      db = await connectDB();
      return db;
    }
  };

  return {
    getDb
  };
};
