// JWT Module
import {Request, Response} from "express";
import * as jwt from 'jsonwebtoken';

interface JWTLoginInfo{
  email: string
};

const CreateLoginJWT = function(inputObject: JWTLoginInfo){
  let token = jwt.sign(inputObject, String(process.env.JWTPRIVATEKEY), {expiresIn: '1h'}); // Login token expire time : 1hour
  return token;
}

const SendUserLoginToken = function(req: Request, res: Response, CreatedJWT: string){
  res.cookie('logintoken', CreatedJWT, {
    expires: new Date(new Date().getTime() + 1000 * 60 * 60), // Client Login cookie expire time : 1hour
    httpOnly: true
  });
  return;
};

const RemoveUserLoginToken = function(req: Request, res: Response){
  res.clearCookie("logintoken");
  return;
};

export {JWTLoginInfo, CreateLoginJWT, SendUserLoginToken, RemoveUserLoginToken}