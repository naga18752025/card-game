const supabase = window.supabase.createClient("https://ngvdppfzcgbkdtjlwbvh.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmRwcGZ6Y2dia2R0amx3YnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODU5NjMsImV4cCI6MjA2MzY2MTk2M30.6bVDy_sbtV4k_AvGeQ_aTtRhz4tBsJb2o_q8Y-OmwMA");

let realtimeChannel = null;
const isFirst = Math.random() < 0.5;
const randomNumber = Math.floor(1000 + Math.random() * 9000);
document.getElementById("roomNumber").textContent = randomNumber.toString();

let logoutOK =true;
let tsunoru = true;

function wait(){
    if(tsunoru){
        startPolling();
        wait2();
        document.getElementById("room").style.display = "block";
        tsunoru = false;
    };
}

async function wait2(){
    localStorage.setItem("turnkanri", randomNumber);
    const name = localStorage.getItem("username");
    const { error: Error } = await supabase
        .from("waiters")
        .insert([
            { 
                "player": name,
                "turn": !isFirst,
                "roomNumber": randomNumber
            }

        ]);

    if (Error) {
        console.error("エラー:", Error);
        alert("通信に失敗しました。");
        return;
    }

    document.getElementById("wait").style.display = "none";
    document.getElementById("join").style.display = "none";
    document.getElementById("topback").style.display = "none"
    document.getElementById("waitRoom").style.display = "block";
    document.getElementById("back").style.display = "block";
    document.getElementById("roomName").textContent = name +"'s room";

    realtimeChannel = supabase
        .channel("my_channel")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "waiters",
                filter: `player=eq.${name}`,
            },
            (payload) => {
                console.log("payload受信", payload);
                if (payload.old && payload.new && payload.old["enemy"] !== payload.new["enemy"]) {
                    localStorage.setItem("enemyname", payload.new["enemy"]);
                    localStorage.setItem("turn", isFirst);
                    localStorage.setItem("reload", "none");
                    document.getElementById("teishi").style.display = "flex";
                    alert(`${payload.new["enemy"]}が対戦相手として見つかりました！`);
                    back();
                    setTimeout(() => {
                        window.location.href = "battle.html";
                    }, 1000);
                    stopPolling();
                }
            }
        )
        .subscribe((status) => {
            console.log("サブスクリプションステータス:", status);
        });
}

let pollingId = null;

// ポーリング開始
function startPolling() {
    const name = localStorage.getItem("username");
    let lastEnemy = null;
    pollingId = setInterval(async () => {
        const { data, error } = await supabase
            .from("waiters")
            .select("enemy")
            .eq("player", name)
            .single();

        if (!error && data.enemy && (data.enemy !== lastEnemy)) {
            lastEnemy = data.enemy;
            localStorage.setItem("enemyname", data.enemy);
            localStorage.setItem("turn", isFirst);
            localStorage.setItem("reload", "none");
            alert(`${data.enemy}が対戦相手として見つかりました！`);
            back();
            setTimeout(() => {
                window.location.href = "battle.html";
            }, 1000);
            stopPolling();
        }
    }, 10000);
}

// ポーリング停止
function stopPolling() {
    if (pollingId !== null) {
        clearInterval(pollingId);
        pollingId = null;
        console.log("ポーリング停止しました");
    }
}

async function join(){
    document.getElementById("wait").style.display = "none";
    document.getElementById("join").style.display = "none";
    document.getElementById("topback").style.display = "none";
    document.getElementById("joinRoom").style.display = "block";
    document.getElementById("back2").style.display = "block";
    const { data, error } = await supabase
    .from("waiters")
    .select("player, turn, roomNumber");
    // テーブル要素を作成
    const table = document.createElement("table");

    // ヘッダー行を追加
    const header = table.insertRow();
    const headerCell = document.createElement("th");
    headerCell.textContent = "対戦待ちユーザー";
    headerCell.colSpan = 2; // ボタン列とユーザー名列を統合
    headerCell.style.textAlign = "center";
    header.appendChild(headerCell);

let hakken = true;

    // 各ユーザー名を行として追加
    data.forEach((waiter) => {
    const row = table.insertRow();
    const nameCell = row.insertCell();
    nameCell.textContent = waiter.player;
    const buttonCell = row.insertCell();
    buttonCell.style.textAlign = "right";
    const newElement = document.createElement("button");
    newElement.textContent = "対戦";
    newElement.id = waiter.player;
    newElement.classList = "taisen";
    buttonCell.appendChild(newElement);
    newElement.addEventListener("click", () => {
        let roomPass = prompt("ルームナンバーを入力してください：");
        // キャンセル or 空文字 対策
        if (!roomPass) {
            return;
        };
        // 全角数字を半角に変換（必要なら）
        roomPass = roomPass.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
        // 数値に変換
        roomPass = Number(roomPass);
        // 数値変換失敗（NaN）対策
        if (isNaN(roomPass)) {
            alert("無効な入力です。数字を入力してください。");
            return;
        };
        if(roomPass === 0){
            return;
        }else if(roomPass !== waiter.roomNumber){
            alert("ルームナンバーが違います");
            return;
        };
        if(hakken && (roomPass === waiter.roomNumber)){
            document.getElementById("teishi").style.display = "flex";
            localStorage.setItem("turn", waiter.turn);
            alert("対戦を開始します")
            enemyLock(newElement.id);
            hakken = false;
            localStorage.setItem("reload", "none");
            setTimeout(() => {
                window.location.href = "battle.html";
            }, 1500);            
        }

    });
    });
    if(data.length === 0){
        const nullCell = table.insertRow().insertCell();
        nullCell.textContent = "No waiters";
        nullCell.style.textAlign = "center";
    }

  // 表を指定のdivに追加
    const container = document.getElementById("joinRoom");
    container.innerHTML = ""; // 一度クリア（重複防止）
    container.appendChild(table);
}

modoru = true;

function back0(){
    if(modoru){
        back();
        modoru = false;
    }
}

async function back(){
    const name = localStorage.getItem("username");
    const { error } = await supabase
        .from('waiters')
        .delete()
        .eq('player', name);
    if (realtimeChannel) {
        await supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }
    setTimeout(() => {
        modoru = true;
    }, 500)
    stopPolling();
}

function back2(){
    tsunoru = true;
    document.getElementById("wait").style.display = "block";
    document.getElementById("join").style.display = "block";
    document.getElementById("topback").style.display = "block"
    document.getElementById("waitRoom").style.display = "none";
    document.getElementById("joinRoom").style.display = "none";
    document.getElementById("back").style.display = "none";
    document.getElementById("back2").style.display = "none";
    document.getElementById("room").style.display = "none";
}

async function enemyLock(id_){
    const name = localStorage.getItem("username");
    localStorage.setItem("enemyname", id_);
    const aite = id_;
    const { error: Error } = await supabase
        .from("waiters")
        .update({"enemy" : name})
        .eq("player", id_)
    if (Error) {
        console.error("エラー:", Error);
        alert("通信に失敗しました。");
        return;
    }
}

function topback(){
    window.location.href = "index.html";
}

function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name === null){
        window.location.href = "login.html";
    }else{
        document.getElementById("loginName").textContent = `${Name}としてログイン中`;
    };
}

nameExistCheck()

async function DataCheck(){
    const name = localStorage.getItem("username");
    // 既に存在しているかチェック
    const { data, error } = await supabase
    .from("waiters")
    .select("id") // 主キーなど一意に識別できるものを選択
    .eq("player", name);

    // 存在していれば削除
    if (data.length > 0) {
    const { error: deleteError } = await supabase
        .from("waiters")
        .delete()
        .eq("player", name);

    if (deleteError) {
        console.error("削除エラー:", deleteError);
    } else {
        console.log("既存のデータを削除しました");
    }
    } else {
    console.log("同名のデータは存在しません");
    }    
}
DataCheck();

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