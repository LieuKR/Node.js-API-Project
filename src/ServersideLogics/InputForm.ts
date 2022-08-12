// Input form module
const Regexp = {
  email: /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // 이메일 양식
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10,}$/, // 영어 대소문자+숫자 (각각 최소 1자 이상, 총 10자 이상)
}

const CheckInputForms = {
  email: function(input: string){
    if(Regexp.email.test(input)) return true;
    return false
  },
  password: function(input: string){
    if(Regexp.password.test(input)) return true;
    return false
  },
}

export {CheckInputForms}