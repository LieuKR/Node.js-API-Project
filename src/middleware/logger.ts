// Server log middleware
import {Request, Response, NextFunction} from "express";

function logger(req: Request, res: Response, next: NextFunction){

  let errormessage : string = '';
  let loginemail : string = '';

  if(res.locals.errorcode) errormessage = ' ' + res.locals.errorcode;
  if(res.locals.loginEmail) loginemail = ' ' + res.locals.loginEmail;

  let logTemplate = `${req.method} ${req.url} ${res.statusCode}${errormessage}${loginemail}`;

  console.log(logTemplate);
  return;

}

export = logger