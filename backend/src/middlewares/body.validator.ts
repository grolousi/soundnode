import * as boom from 'boom';
import * as joi from 'joi';
import { Request, Response } from 'express';

export const validateBody = (schema) => {
  return (req: Request, res: Response, next): Response => {
    console.log('here');
    const result = joi.validate(req.body, schema, {
      stripUnknown: { objects: true }
    });
    if (result.error) {
      const boomed = boom.badRequest(result.error.message);
      return res.status(boomed.output.statusCode).json(boomed.output.payload);
    }
    next();
  };
};
