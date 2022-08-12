import {Request, Response, NextFunction} from "express";
import {GetDBConnection, GenerateQuery} from "@src/ServersideLogics/RDBMS";
import {EncryptString} from "@src/ServersideLogics/Encryption";
import {CheckInputForms} from "@src/ServersideLogics/InputForm";
import {JWTLoginInfo, CreateLoginJWT, SendUserLoginToken, RemoveUserLoginToken} from "@src/ServersideLogics/LoginToken";

interface ClientResponse{
  error: boolean,
  status: number,
  message?: string,
  data?: any
};

interface DBUserInfoResponse{
  id: number,
  email: string,
  password: string,
  AvaliableLoginReq: number,
  LastLoginAttemptTimestamp: number
};


const signin = async function(req : Request, res : Response, next: NextFunction) {

  if(res.locals.loginEmail){
    next(new Error("Err-341e0")); 
    return;
  }

  let email : string = req.body.email;
  let pass : string = req.body.pass;

  try{
    await signinMethods.checkInputEmailFormat(email);
    await signinMethods.checkInputPasswordFormat(pass);

    let connection = await GetDBConnection('userinfo');

    await signinMethods.checkAlreadyExistSameEmail(email, connection);
    await signinMethods.AddUserAccountInDB(email, pass, connection);

    let response : ClientResponse = {
      error: false,
      status: 200,
      message: "계정이 생성되었습니다!"
    }
    res.send(response);
    next();

  } catch(e){
    if(typeof e == "string") next(new Error(e));
    else next(new Error());
  }
};
const signinMethods = {
  checkInputEmailFormat : function(email: string){
    return new Promise(function(rs, rj){

      if(CheckInputForms.email(email)){
          return rs(true);
      } else {
          return rj("Err-341e1");
      }

    });
  },
  checkInputPasswordFormat : function(pass: string){
    return new Promise(function(rs, rj){

      if(CheckInputForms.password(pass)){
        return rs(true);
      } else {
        return rj("Err-341e2");
      }

    });
  },
  checkAlreadyExistSameEmail: function(email: string, connection: any){
    return new Promise(function(rs, rj){
      connection.query(GenerateQuery.userApi.CheckSameEmailAccountNumber(email), function(err: any, DBres: any){
        if(err){ 
          connection.end();
          return rj("Err-341e11");
        } else if(DBres[0].cnt > 0){
          connection.end();
          return rj("Err-341e3");
        } else{
          return rs(true);
        }
      });
    });
  },
  AddUserAccountInDB: function(email: string, pass: string, connection: any){
    return new Promise(function(rs, rj){  

      let encryptedPass : string = EncryptString(pass);

      connection.query(GenerateQuery.userApi.CreateNewAccount(email, encryptedPass), function(err: any, DBres: any){
        connection.end();
        if(err){
          return rj("Err-341e12");
        } else if(DBres.affectedRows == 0){
          return rj("Err-341e13");
        } else{
          return rs(true);
        }
      });

    });
  },
};


const login = async function(req : Request, res : Response, next: NextFunction) {

  if(res.locals.loginEmail){
    next(new Error("Err-342e0")); 
    return
  }

  let email : string = req.body.email;
  let pass : string = req.body.pass;

  let currentDate : Date = new Date()
  let currentTime : number = currentDate.getTime();

  try{
    let connection = await GetDBConnection('userinfo');

    let UserInfo : DBUserInfoResponse = await loginMethods.GetUserAccountFromDB(email, connection);
    UserInfo = await loginMethods.CheckUserLoginAttempt(UserInfo, currentTime);

    let IsPasswordSame : boolean = await loginMethods.CheckUserPassword(pass, UserInfo.password);

    if(IsPasswordSame) await loginMethods.LoginSuccessMethod(UserInfo, currentTime, connection);
    else await loginMethods.LoginFailedMethod(UserInfo, currentTime, connection);

    let JWTLoginInfo : JWTLoginInfo = {
      email: email
    };
      
    SendUserLoginToken(req, res, CreateLoginJWT(JWTLoginInfo));

    let response : ClientResponse = {
      error: false,
      status: 200,
      message: "로그인이 성공하였습니다!"
    }
    res.send(response);
    next();

  } catch(e){
    if(typeof e == "string") next(new Error(e));
    else next(new Error());
  }

};
const LoginSettings = {
  LoginBanTime : 1000 * 60 * 5, // 5분
  MaxLoginAttemptFailNum : 5 // 최대 연속 로그인 시도 실패 횟수
};
const loginMethods = {
  // Get user infomation from DB by email
  GetUserAccountFromDB: function(email: string, connection: any){
    return new Promise<DBUserInfoResponse>(function(rs, rj){
      connection.query(GenerateQuery.userApi.SelectUserAccountColumnByEmail(email), function(err: any, DBres: any){
        if(err){
          connection.end();
          return rj("Err-342e11");
        } else if(DBres.length === 1){
          let DBUserInfoResponse : DBUserInfoResponse = {
            id: DBres[0].id,
            email: DBres[0].email,
            password: DBres[0].password,
            AvaliableLoginReq: DBres[0].AvaliableLoginReq,
            LastLoginAttemptTimestamp: DBres[0].LastLoginAttemptTimestamp
          };
          return rs(DBUserInfoResponse);
        } else {
          connection.end();
          return rj("Err-342e1");
        }
      });
    });
  },

  /**
   * @param AvaliableLoginReq 가능한 로그인 횟수
   * @param LastLoginAttemptTimestamp 최근 로그인 시간 
   * @param currentTime 현재 시간
   * @returns Modified UserInfo
   */
  CheckUserLoginAttempt: function(UserInfo: DBUserInfoResponse, currentTime: number){
    return new Promise<DBUserInfoResponse>(function(rs, rj){

      if(UserInfo.AvaliableLoginReq <= 0 && currentTime - UserInfo.LastLoginAttemptTimestamp < LoginSettings.LoginBanTime) return rj("Err-342e2");
      else {
        if(UserInfo.AvaliableLoginReq == 0) UserInfo.AvaliableLoginReq = LoginSettings.MaxLoginAttemptFailNum;
        return rs(UserInfo);
      }
    });
  },

  /**
   * @param inputPass Unhashed input password
   * @param dbHashedPass Hassed password from DB
   * @returns true : password is correct // false : password is incorrect
   */
  CheckUserPassword: function(inputPass: string, dbHashedPass: string){
    return new Promise<boolean>(function(rs, rj){

      let HashedInputPass : string = EncryptString(inputPass);

      if(HashedInputPass === dbHashedPass) return rs(true);
      else return rs(false);

    });
  },

  LoginSuccessMethod: function(UserInfo: DBUserInfoResponse, currentTime: number, connection: any){
    return new Promise(function(rs, rj){
      connection.query(GenerateQuery.userApi.AfterSuccessUserLogin(UserInfo.AvaliableLoginReq, currentTime, UserInfo.id), function(err: any, DBres: any){
        connection.end();
        if(err) return rj("Err-342e13");
        else return rs(true);
      });
    });
  },

  LoginFailedMethod: function(UserInfo: DBUserInfoResponse, currentTime: number, connection: any){
    return new Promise(function(rs, rj){
    connection.query(GenerateQuery.userApi.AfterFailUserLogin(UserInfo.AvaliableLoginReq, currentTime, UserInfo.id), function(err: any, DBres: any){
        connection.end();
        if(err) return rj("Err-342e13");
        else return rj("Err-342e3");
      });
    });
  },
};


const update = async function(req : Request, res : Response, next: NextFunction){

  if(!res.locals.loginEmail){
    next(new Error("Err-344e0"));
    return
  }

  let loginEmail = res.locals.loginEmail;
  let pass_origin : string = req.body.passOrigin;
  let pass_new : string = req.body.passNew;

  if(pass_origin === pass_new){
    next(new Error("Err-344e2"));
    return
  }

  if(!CheckInputForms.password(pass_new)){
    next(new Error("Err-344e3"));
    return
  }

  try{
    let connection = await GetDBConnection('userinfo');
    let userinfoPK: number = await updateMethods.IsInputPasswordTrue(loginEmail, pass_origin, connection);
    await updateMethods.UpdatePassword(userinfoPK, pass_new, connection);

    let response : ClientResponse = {
      error: false,
      status: 200,
      message: "비밀번호가 변경되었습니다!"
    }
    res.send(response);
    next();

  } catch(e){
    if(typeof e == "string") next(new Error(e));
    else next(new Error());
  }

};
const updateMethods = {
  /**
   * @description Error => reject, Wrong PW => reject, Correct PW => response
   * @return userinfo table's Primal Key for target user
   */
  IsInputPasswordTrue: function(loginEmail: string, pass_origin: string, connection: any){
    return new Promise<number>(function(rs, rj){
      let HashedInputPass : string = EncryptString(pass_origin);
      connection.query(GenerateQuery.userApi.IsUserPasswordTrue(loginEmail, HashedInputPass), function(err: any, DBres: any){

        console.log(loginEmail, HashedInputPass, DBres[0])

        if(err){
          connection.end();
          return rj("Err-344e11");
        } else if(DBres[0].cnt === 1){
          return rs(Number(DBres[0].id));
        } else {
          connection.end();
          return rj("Err-344e1");
        }
      });
    })
  },

  UpdatePassword: function(userinfoPK: number, pass_new: string, connection: any){
    return new Promise<void>(function(rs, rj){

      let HashedInputPass : string = EncryptString(pass_new);
      connection.query(GenerateQuery.userApi.changePassword(HashedInputPass, userinfoPK), function(err: any, DBres: any){
        connection.end();
        if(err){
          return rj("Err-344e12");
        } else if(DBres.affectedRows === 1){
          return rs();
        } else{
          return rj("Err-344e13");
        }
      });
    })
  },

};


const logout = function(req : Request, res : Response, next: NextFunction) {
    
  if(!res.locals.loginEmail){
    next(new Error("Err-343e0"));
    return;
  }

  RemoveUserLoginToken(req, res);
  let response : ClientResponse = {
    error: false,
    status: 200,
    message: "로그아웃 되었습니다"
  }
  res.send(response);
  next();

};


const signout = async function(req : Request, res : Response, next: NextFunction) {
  if(!res.locals.loginEmail){
    next(new Error("Err-345e0"));
    return;
  }

  let loginEmail = res.locals.loginEmail;
  let inputPass : string = req.body.pass;

  try{
    let connection = await GetDBConnection('userinfo');
    let userinfoPK: number = await signoutMethods.IsInputPasswordTrue(loginEmail, inputPass, connection);
    await signoutMethods.RemoveAccount(userinfoPK, connection);

    RemoveUserLoginToken(req, res);

    let response : ClientResponse = {
      error: false,
      status: 200,
      message: "계정이 삭제되었습니다!"
    }
    res.send(response);
    next();

  } catch(e){
    if(typeof e == "string") next(new Error(e));
    else next(new Error());
  }
};
const signoutMethods = {
  /**
   * @description Error => reject, Wrong PW => reject, Correct PW => response
   * @return userinfo table's Primal Key for target user
   */
  IsInputPasswordTrue: function(loginEmail: string, inputPass: string, connection: any){
    return new Promise<number>(function(rs, rj){

      let HashedInputPass : string = EncryptString(inputPass);
      connection.query(GenerateQuery.userApi.IsUserPasswordTrue(loginEmail, HashedInputPass), function(err: any, DBres: any){
        if(err){
          connection.end();
          return rj("Err-345e11");
        } else if(DBres[0].cnt === 1){
          return rs(Number(DBres[0].id));
        } else {
          connection.end();
          return rj("Err-345e1");
        }
      });
    });
  },

  RemoveAccount: function(userinfoPK: number, connection: any){
    return new Promise<void>(function(rs, rj){

      connection.query(GenerateQuery.userApi.deleteUserAccount(userinfoPK), function(err: any, DBres: any){
        connection.end();
        if(err){
          return rj("Err-345e12");
        } else if(DBres.affectedRows === 1){
          return rs();
        } else{
          return rj("Err-345e13");
        }
      });
    });
  },
};

export {signin, login, update, logout, signout}