import { NextFunction, Request, Response } from "express";
import Line from "../services/line";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const line = new Line();
  if (!line.validateSignature(req.body, req.headers['x-line-signature'])) {
    return res.status(401).json({ message: "Invalid signature received" })
  }
  next()
};