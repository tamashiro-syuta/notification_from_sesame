import { Request, Response } from 'express';

export const healthCheck = (_: Request, res: Response) => {
  return res.sendStatus(200);
}