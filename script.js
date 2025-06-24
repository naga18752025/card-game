document.getElementById("rule").addEventListener("click", function () {
  window.location.href = "rules.html"; // 遷移先のファイル名
});

document.getElementById("start").addEventListener("click", function () {
  if(localStorage.getItem("username") !== null){
    window.location.href = "search.html";
  }else{
    window.location.href = "login.html"; // 遷移先のファイル名
  }
});

function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name !== null){
      document.getElementById("loginName").textContent = `${Name}としてログイン中`;
    }else{
      document.getElementById("loginName").textContent = `未ログイン`; 
      document.getElementById("logout").style.display = "none";
    }
}

document.getElementById("logout").addEventListener("click", function(){
  localStorage.removeItem("username");
  location.reload();
})

nameExistCheck()