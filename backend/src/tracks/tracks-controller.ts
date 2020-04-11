import { TracksService } from './tracks-services';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import * as multer from 'multer';

const trackService = new TracksService();
export const tracksController = {
  getTrack: (req: Request, res: Response): void | Response => {
    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');
    return trackService.getTrack(req, res);
  },
  uploadTrack: (req: Request, res: Response): void => {
    const readableTrackStream = new Readable();
    const storage = multer.memoryStorage();

    const upload = multer({
      storage: storage,
      limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 }
    });

    upload.single('track')(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: 'Upload Request Validation Failed' });
      } else if (!req.body.name) {
        return res
          .status(400)
          .json({ message: 'No track name in request body' });
      }
      const trackName: string = req.body.name;

      const uploadStream = trackService.uploadTrack(
        readableTrackStream,
        req,
        trackName
      );
      const id = uploadStream.id;
      uploadStream.on('error', () => {
        res.status(500).json({ message: 'Error uploading file' });
      });
      uploadStream.on('finish', () => {
        trackService.addTrackInfos(id, trackName);
        res.status(201).json({
          message:
            'File uploaded successfully, stored under Mongo ObjectID: ' + id
        });
      });
    });
  }
};
