// Favicon Middleware
import {Request, Response, NextFunction} from "express";

function NoFavicon(req: Request, res: Response, next: NextFunction) {
  res.status(204).end();
  return;
}

export = NoFavicon