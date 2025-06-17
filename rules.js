function topback(){
    window.location.href = "index.html";
}

function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name !== null){
    document.getElementById("loginName").textContent = `${Name}としてログイン中`;
    }else{
    document.getElementById("loginName").textContent = `未ログイン`; 
    document.getElementById("logout").style.display = "none";
    }
}

nameExistCheck();