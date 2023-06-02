import { NextFunction, Request, Response } from "express";
import Line from "../services/line";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const line = new Line();

  if (req.body.events === undefined) {
    return res.status(500).json({ message: "There is not req.body.events" })
  }

  const userId: string = req.body.events[0].source.userId
  if (!line.isAuthenticated(userId)) {
    console.log('userId')
    console.log(userId)
    return res.status(401).json({ message: "You are invalid user!!!!" })
  }

  next()
};