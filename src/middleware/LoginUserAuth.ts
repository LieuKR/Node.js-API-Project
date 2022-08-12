// 사용자 인증 미들웨어
import {Request, Response, NextFunction} from "express";
import {JWTLoginInfo, CreateLoginJWT, SendUserLoginToken} from "@src/ServersideLogics/LoginToken";
import * as jwt from 'jsonwebtoken';
 
/**
 * @description 
 * 1. Check request contain valid login token 
 * 2. If exist valid token, save logined user email in res.locals.loginEmail
 * 3. After this middleware, we can check request is come from logined user or not
 */
function checkLoginToken(req: Request, res: Response, next: NextFunction) {

  if(!req.cookies.logintoken){
    res.locals.loginEmail = null;
    next();
    return;
  }

  jwt.verify(req.cookies.logintoken, String(process.env.JWTPRIVATEKEY), function(err: any, decode: any){

    // invalid token
    if(err){
      res.clearCookie("logintoken"); // remove cookie in frontside
      res.locals.loginEmail = null;
      next();
      return;
    } 

    // update user login token in frontside
    let JWTLoginInfo : JWTLoginInfo = {email: decode.email};
    SendUserLoginToken(req, res, CreateLoginJWT(JWTLoginInfo));

    res.locals.loginEmail = decode.email;
    next();
    return;
  });

}
export = checkLoginToken