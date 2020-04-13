import { badRequest } from 'boom';
import { validate } from 'joi';
import { Request, Response } from 'express';

export const validateBody = (schema) => {
  return (req: Request, res: Response, next): Response => {
    const result = validate(req.body, schema, {
      stripUnknown: { objects: true }
    });
    if (result.error) {
      const boomed = badRequest(result.error.message);
      return res.status(boomed.output.statusCode).json(boomed.output.payload);
    }
    next();
  };
};
