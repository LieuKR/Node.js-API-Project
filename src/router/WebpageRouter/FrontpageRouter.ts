import express, {Request, Response, NextFunction} from "express";
import {GetPageHtmlAbsolutePath} from "@src/ServersideLogics/FilePath";
const router = express.Router();

// Mainpage serve router
router.get('/', function(req : Request, res : Response, next: NextFunction){
  res.sendFile(GetPageHtmlAbsolutePath("mainpage"));
  next();
  return;
});

export = router;