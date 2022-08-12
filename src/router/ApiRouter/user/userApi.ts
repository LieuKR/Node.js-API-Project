import express, {Request, Response, NextFunction} from "express";
import * as userApiLogic from "@src/ApiLogics/user";

const router = express.Router();

// 회원 가입 API
router.post('/signin', function(req : Request, res : Response, next: NextFunction){
  userApiLogic.signin(req, res, next);
  return;
});

// 로그인 API
router.post('/login', async function(req : Request, res : Response, next: NextFunction){
  userApiLogic.login(req, res, next);
  return;
});

// 회원 정보 업데이트 API
router.post('/update', async function(req : Request, res : Response, next: NextFunction){
  userApiLogic.update(req, res, next);
  return;
});

// 로그아웃 API
router.post('/logout', function(req : Request, res : Response, next: NextFunction) {
  userApiLogic.logout(req, res, next);
  return;
});

// 회원 탈퇴 API
router.post('/signout', async function(req : Request, res : Response, next: NextFunction) {
  userApiLogic.signout(req, res, next);
  return;
});

export = router;