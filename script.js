document.getElementById("rule").addEventListener("click", function () {
  window.location.href = "rules.html"; // 遷移先のファイル名
});

document.getElementById("start").addEventListener("click", function () {
  window.location.href = "login.html"; // 遷移先のファイル名
});

function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name.length > 1){
      document.getElementById("loginName").textContent = `${Name}としてログイン中`;
    }
}

nameExistCheck()