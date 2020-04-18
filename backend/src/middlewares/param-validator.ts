import { Request, Response, NextFunction } from 'express';
import { validate, any } from 'joi';
import { badRequest } from 'boom';
import { ObjectID } from 'mongodb';

export const idSchema = {
  id: any().required()
};

export const validateParams = (schema) => {
  return (req: Request, res: Response, next: NextFunction): Response => {
    const result = validate(req.params, schema, { stripUnknown: true });
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
        return res.status(400).json({ message: 'Invalid trackId in URL parameter.' });
      }
    }

    next();
  };
};
