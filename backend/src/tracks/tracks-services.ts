import * as mongodb from 'mongodb';
import { Request, Response } from 'express';
import { Readable } from 'stream';
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const urlDB = 'mongodb://localhost:27017';
const dbName = 'trackDb';
const trackInfosCollectionName = 'trackInfos';

export class TracksService {
  private db: mongodb.Db;

  constructor() {
    MongoClient.connect(urlDB, (err, client) => {
      if (err) {
        console.log(
          'MongoDB Connection Error. Please make sure that MongoDB is running.'
        );
        process.exit(1);
      }
      this.db = client.db(dbName);
    });
  }

  getTrack(req: Request, res: Response): void | Response {
    let trackId: mongodb.ObjectID;

    try {
      trackId = new ObjectID(req.params.trackId);
    } catch (err) {
      return res
        .status(400)
        .json({ message: 'Invalid trackId in URL parameter.' });
    }

    const bucket = new mongodb.GridFSBucket(this.db, {
      bucketName: 'tracks'
    });

    const downloadStream = bucket.openDownloadStream(trackId);

    downloadStream
      .on('data', (chunk) => {
        res.write(chunk);
      })
      .on('error', (err) => {
        res.status(400).json(err);
      })
      .on('end', () => {
        res.end();
      });
  }

  uploadTrack(
    readableTrackStream: Readable,
    req: Request,
    trackName: string
  ): mongodb.GridFSBucketWriteStream {
    readableTrackStream.push(req.file.buffer);

    const bucket = new mongodb.GridFSBucket(this.db, {
      bucketName: 'tracks'
    });

    const uploadStream = bucket.openUploadStream(trackName);

    readableTrackStream.pipe(uploadStream);
    readableTrackStream.push(null);
    return uploadStream;
  }

  addTrackInfos(
    id,
    trackName: string
  ): Promise<
    mongodb.InsertOneWriteOpResult<{
      _id: mongodb.ObjectID;
      trackId;
      trackName: string;
    }>
  > {
    return this.db
      .collection(trackInfosCollectionName)
      .insertOne({ trackId: id, trackName });
  }
}
