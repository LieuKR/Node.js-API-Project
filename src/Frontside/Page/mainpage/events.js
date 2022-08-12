// Add event for click signin button
document.querySelector(".signIn .SubmitBtn>input").addEventListener("click", function(){

    let data = {}
    data.email = document.querySelector(".signIn .inputEmail>input").value;
    data.pass = document.querySelector(".signIn .inputPass>input").value;

    console.log("회원 가입 시도", data);
    
    SendAPIRequest(LocalAPI.signin, data);

})

// Add event for click login button
document.querySelector(".login .SubmitBtn>input").addEventListener("click", function(){

    let data = {}
    data.email = document.querySelector(".login .inputEmail>input").value;
    data.pass = document.querySelector(".login .inputPass>input").value;

    console.log("로그인 시도", data);

    SendAPIRequest(LocalAPI.login, data);

})

// Add event for click changePassword button
document.querySelector(".changePassword .SubmitBtn>input").addEventListener("click", function(){

    let data = {}
    data.passOrigin = document.querySelector(".changePassword .inputPassOrigin>input").value;
    data.passNew = document.querySelector(".changePassword .inputPassNew>input").value;

    console.log("비밀번호 변경 시도", data);

    SendAPIRequest(LocalAPI.update, data);

})

// Add event for click logout button
document.querySelector(".logout .SubmitBtn>input").addEventListener("click", function(){

    console.log("로그아웃 시도");

    SendAPIRequest(LocalAPI.logout);

})

// Add event for click signout button
document.querySelector(".signout .SubmitBtn>input").addEventListener("click", function(){

    let data = {}
    data.pass = document.querySelector(".signout .inputPass>input").value;

    console.log("회원 탈퇴 시도", data);

    SendAPIRequest(LocalAPI.signout, data);

})


const LocalAPI = {
    signin: {url: "http://localhost:4000/api/user/signin", method: "POST"},
    login: {url: "http://localhost:4000/api/user/login", method: "POST"},
    update: {url: "http://localhost:4000/api/user/update", method: "POST"},
    logout: {url: "http://localhost:4000/api/user/logout", method: "POST"},
    signout: {url: "http://localhost:4000/api/user/signout", method: "POST"},
}

function SendAPIRequest(params, data){

    let xhr = new XMLHttpRequest();

    let url = params.url;
    let method = params.method;

    xhr.open(method, url);

    xhr.onreadystatechange = function () {
        // Get response from API request
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log("Server response : ", xhr.responseText);
        }
    };

    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
}