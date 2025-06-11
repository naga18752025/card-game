function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name.length > 1){
      document.getElementById("loginName").textContent = `${Name}としてログイン中`;
    }
}

nameExistCheck()