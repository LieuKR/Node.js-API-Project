// Error handler middleware
import {Request, Response, NextFunction} from "express";

interface errorInfo{
  status: number,
  message?: string
}

interface Errorlist {
  [key: string]: errorInfo;
}

interface ClientErrorResponse{
  error: boolean,
  status: number,
  errno?: string,
  message?: string,
  data?: string
}

const BasicError : errorInfo = {status: 500, message: "Oops, Something went wrong."};
const Errorlist : Errorlist = {
  "Err-341DB": {status: 500}, // DB 서버 커넥션 생성 실패
  // Err-341e : Error from signin
  "Err-341e0": {status: 400, message: "이미 로그인된 상태입니다"},
  "Err-341e1": {status: 400, message: "올바른 이메일 양식을 입력하십시오"},
  "Err-341e2": {status: 400, message: "비밀번호는 총 10글자 이상 영어와 숫자이며, 영문과 숫자를 최소 하나 포함하여야 합니다."},
  "Err-341e3": {status: 400, message: "중복되는 아이디가 존재합니다"},
  "Err-341e11": {status: 500},
  "Err-341e12": {status: 500},
  "Err-341e13": {status: 500},
  // Err-342e : Error from login
  "Err-342e0": {status: 400, message: "이미 로그인된 상태입니다"},
  "Err-342e1": {status: 400, message: "가입되지 않은 이메일 주소입니다"},
  "Err-342e2": {status: 400, message: "5분간 로그인 시도를 할 수 없습니다"},
  "Err-342e3": {status: 400, message: "비밀번호가 잘못되었습니다"},
  "Err-342e11": {status: 500},
  "Err-342e12": {status: 500},
  // Err-343e : Error from logout
  "Err-343e0": {status: 400, message: "로그인 상태가 아닙니다"},
  // Err-344e : Error from update
  "Err-344e0": {status: 400, message: "로그인 상태가 아닙니다"},
  "Err-344e1": {status: 400, message: "잘못된 비밀번호입니다"},
  "Err-344e2": {status: 400, message: "같은 비밀번호로는 변경할 수 없습니다"},
  "Err-344e3": {status: 400, message: "비밀번호는 총 10글자 이상 영어와 숫자이며, 영문과 숫자를 최소 하나 포함하여야 합니다."},

  "Err-344e11": {status: 500},
  "Err-344e12": {status: 500},
  "Err-344e13": {status: 500},

  // Err-345e : Error from signout
  "Err-345e0": {status: 400, message: "로그인 상태가 아닙니다"},
  "Err-345e1": {status: 400, message: "잘못된 비밀번호입니다"},

  "Err-345e11": {status: 500},
  "Err-345e12": {status: 500},
  "Err-345e13": {status: 500},

};

function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {

  let errorCode : string = error.message;
  let errorData = (Errorlist.hasOwnProperty(errorCode)) ? Errorlist[errorCode] : BasicError;

  let response : ClientErrorResponse = {
    errno: errorCode,
    status: errorData.status,
    error: true,
    message: (errorData.message) ? errorData.message : BasicError.message,
  }

  res.locals.errorcode = errorCode;
  res.status(errorData.status).send(response);

  next();
  return;
}

export = errorHandler