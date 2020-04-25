import { badRequest } from 'boom';
import { validate } from 'joi';
import { Request, Response } from 'express';
import { ObjectID } from 'mongodb';

export const validateBody = (schema) => {
  return (req: Request, res: Response, next): Response => {
    const result = validate(req.body, schema);

    if (result.error) {
      const boomed = badRequest(result.error.message);
      return res.status(boomed.output.statusCode).json(boomed.output.payload);
    }
    if (req.params.id) {
      //TODO export this into utils
      try {
        new ObjectID(req.params.id);
      } catch (err) {
        //TODO BOOM
        return res.status(400).json({ message: 'Invalid trackId in body.' });
      }
    }
    next();
  };
};
