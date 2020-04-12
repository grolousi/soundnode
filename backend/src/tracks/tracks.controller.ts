import { tracksDal } from './tracks.dal';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import * as multer from 'multer';

interface TracksControllerReturnType {
  getTrack: (req: Request, res: Response) => Promise<void>;
  uploadTrack: (req, Request, res: Response) => void;
}

export const tracksController = async (): Promise<TracksControllerReturnType> => {
  const dal = await tracksDal();

  return {
    getTrack: async (req: Request, res: Response): Promise<void> => {
      res.set('content-type', 'audio/mp3');
      res.set('accept-ranges', 'bytes');
      const downloadStream = await dal.getTrackReadStream(req, res);
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
    },
    uploadTrack: (req: Request, res: Response): void => {
      const readableTrackStream = new Readable();
      const storage = multer.memoryStorage();

      const upload = multer({
        storage: storage,
        limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 }
      });

      upload.single('track')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: 'Upload Request Validation Failed' });
        } else if (!req.body.name) {
          return res.status(400).json({ message: 'No track name in request body' });
        }
        const trackName: string = req.body.name;

        const uploadStream = await dal.uploadTrack(readableTrackStream, req, trackName);
        const id = uploadStream.id;
        uploadStream.on('error', () => {
          res.status(500).json({ message: 'Error uploading file' });
        });
        uploadStream.on('finish', async () => {
          await dal.addTrackInfos(id, trackName);
          res.status(201).json({
            message: 'File uploaded successfully, stored under Mongo ObjectID: ' + id
          });
        });
      });
    }
  };
};
