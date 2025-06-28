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

const draggable = document.getElementById("draggable");

let offsetX = 0;
let offsetY = 0;
let isDragging = false;
const elemWidth = draggable.offsetWidth;
const elemHeight = draggable.offsetHeight;
draggable.ondragstart = () => false;
// マウス用イベント
draggable.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - draggable.offsetLeft;
  offsetY = e.clientY - draggable.offsetTop;
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  moveWithinBounds(e.clientX, e.clientY);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.userSelect = "";
});

// タッチ用イベント
draggable.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  offsetX = touch.clientX - draggable.offsetLeft;
  offsetY = touch.clientY - draggable.offsetTop;
}, { passive: false });

draggable.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  moveWithinBounds(touch.clientX, touch.clientY);
}, { passive: false });

function moveWithinBounds(clientX, clientY) {
  // ドラッグ位置候補
  let newLeft = clientX - offsetX;
  let newTop = clientY - offsetY;

  // 画面外に出ないように制限
  newLeft = Math.max(0, Math.min(window.innerWidth - elemWidth, newLeft));
  newTop = Math.max(0, Math.min(window.innerHeight - elemHeight, newTop));

  draggable.style.left = newLeft + "px";
  draggable.style.top = newTop + "px";
}

let lastTap = 0;
let timeoutId = null;
let originalImage = "yurukyara_huwahuwa.png";
let altImage = "yurukyara_cheering.png";

// マウス用（PC）
draggable.addEventListener("dblclick", () => {
    changeImageTemporarily();
});

// タッチ用（スマホ）
draggable.addEventListener("touchend", () => {
    const now = Date.now();
    if (now - lastTap < 300) {
        changeImageTemporarily();
    }
    lastTap = now;
});

// 画像を一時的に差し替える処理
function changeImageTemporarily() {
    if (draggable.src.includes(altImage)) return; // 連続で切り替わらないように防止

    draggable.src = altImage;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        draggable.src = originalImage;
    }, 2000); // 2秒後に戻す
}