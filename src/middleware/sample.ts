import { NextFunction, Request, Response } from "express";

export const sampleMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('next!!!!!!')

  next()
};