import { Readable } from 'stream';
import { Request, Response } from 'express';
import * as multer from 'multer';
import { ObjectID } from 'mongodb';
import { tracksService } from './tracks.service';
import { errorLogger } from '../logger';
import { decodeToken } from '../authentification/utils/jwt';
import { TrackInfosType } from '../shared/types/tracks.types';
import { badRequest, internal } from 'boom';

interface TracksControllerReturnType {
  getTrack: (req: Request, res: Response) => Promise<Response>;
  uploadTrack: (req, Request, res: Response) => Response;
  likeTrack: (req, Request, res: Response) => Promise<Response>;
  unlikeTrack: (req, Request, res: Response) => Promise<Response>;
  addCommentToTrack: (req, Request, res: Response) => Promise<Response>;
}

export const tracksController = async (): Promise<TracksControllerReturnType> => {
  const service = await tracksService();

  return {
    getTrack: async (req: Request, res: Response): Promise<Response> => {
      try {
        res.set('content-type', 'audio/mp3');
        res.set('accept-ranges', 'bytes');
        let trackId: ObjectID;

        try {
          trackId = new ObjectID(req.params.trackId);
        } catch (err) {
          //TODO BOOM
          return res.status(400).json({ message: 'Invalid trackId in URL parameter.' });
        }
        const downloadStream = await service.getTrackReadStream(trackId);
        downloadStream
          .on('data', (chunk) => {
            res.write(chunk);
          })
          .on('error', (err) => {
            //TODO BOOM
            return res.status(400).json(err);
          })
          .on('end', () => {
            return res.end();
          });
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        return res.status(500);
      }
    },
    uploadTrack: (req: Request, res: Response): Response => {
      try {
        const readableTrackStream = new Readable();
        const storage = multer.memoryStorage();

        const upload = multer({
          storage: storage,
          limits: { fields: 2, fileSize: 6000000, files: 1, parts: 3 }
        });

        upload.single('track')(req, res, async (err) => {
          if (err) {
            //TODO BOOM
            return res.status(400).json({ message: 'Upload Request Validation Failed' });
          } else if (!req.body.title) {
            //TODO BOOM
            return res.status(400).json({ message: 'No track name in request body' });
          }

          const uploadStream = await service.uploadTrack(readableTrackStream, req.file, req.body.title);
          const id = uploadStream.id;
          const trackInfos: TrackInfosType = {
            trackId: id,
            title: req.body.title,
            description: req.body.description,
            likes: 0,
            comments: []
          };
          uploadStream.on('error', () => {
            //TODO BOOM
            res.status(500).json({ message: 'Error uploading file' });
          });
          uploadStream.on('finish', async () => {
            try {
              const userId = decodeToken(req.headers.authorization.split(' ')[1]).userId;
              const result = await service.addTrackInfos(id, trackInfos);
              await service.addTrackToArtist(new ObjectID(userId), result.insertedId);

              res.status(201).json({
                //TODO STRING
                message: 'File uploaded successfully, stored under Mongo ObjectID: ' + id
              });
            } catch (error) {
              errorLogger('tracks.controller : ' + error);
              //TODO BOOM
              res.status(500);
            }
          });
        });
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        return res.status(500);
      }
    },
    likeTrack: async (req: Request, res: Response): Promise<Response> => {
      try {
        const { artistId } = decodeToken(req.headers.authorization.split(' ')[1]);
        const { trackId } = req.body;
        const result = await service.likeTrack(new ObjectID(artistId), new ObjectID(trackId));
        if (!result.status) {
          const boomed = badRequest(result.message);
          errorLogger(boomed.output.payload.message);
          return res.status(boomed.output.statusCode).json(boomed.output.payload);
        }
        return res.status(200).json(trackId);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        return res.status(500);
      }
    },
    unlikeTrack: async (req: Request, res: Response): Promise<Response> => {
      try {
        const { artistId } = decodeToken(req.headers.authorization.split(' ')[1]);
        const { trackId } = req.body;
        const result = await service.unlikeTrack(new ObjectID(artistId), new ObjectID(trackId));
        if (!result.status) {
          const boomed = badRequest(result.message);
          errorLogger(boomed.output.payload.message);
          return res.status(boomed.output.statusCode).json(boomed.output.payload);
        }
        return res.status(200).json(trackId);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        return res.status(500);
      }
    },
    addCommentToTrack: async (req: Request, res: Response): Promise<Response> => {
      try {
        const { artistId } = decodeToken(req.headers.authorization.split(' ')[1]);
        const { trackId, comment } = req.body;
        const result = await service.addCommentToTrack(
          new ObjectID(artistId),
          comment,
          new ObjectID(trackId)
        );
        if (!result) {
          const boomed = internal();
          errorLogger(boomed.output.payload.message);
          return res.status(boomed.output.statusCode).json(boomed.output.payload);
        }
        return res.status(200).json(trackId);
      } catch (error) {
        errorLogger(error);
        //TODO BOOM
        return res.status(500);
      }
    }
  };
};
