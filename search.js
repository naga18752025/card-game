const supabase = window.supabase.createClient("https://ngvdppfzcgbkdtjlwbvh.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmRwcGZ6Y2dia2R0amx3YnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODU5NjMsImV4cCI6MjA2MzY2MTk2M30.6bVDy_sbtV4k_AvGeQ_aTtRhz4tBsJb2o_q8Y-OmwMA");

let realtimeChannel = null;
const isFirst = Math.random() < 0.5;

let logoutOK =true;
let tsunoru = true;

// 山札作成
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];  // 絵柄（省略してもOK）
    const deck = [];
    // 1〜13を4スート分入れる（1=A, 11=J, 12=Q, 13=K）
    for (let suit of suits) {
        for (let i = 1; i <= 13; i++) {
            deck.push(`${suit}${i}`);
        };
    };
    // JOKERを1枚（必要に応じて増やせる）
    deck.push("JOKER");
    deck.push("JOKER");
    // シャッフル（Fisher-Yatesアルゴリズム）
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    };
    return deck;
}
const newdeck = createDeck();

function wait(){
    if(tsunoru){
        wait2();
        tsunoru = false;
    };
}

async function wait2(){
    localStorage.setItem("deck", JSON.stringify(newdeck));
    const name = localStorage.getItem("username");
    const { error: Error } = await supabase
        .from("waiters")
        .insert([
            { 
                "player": name,
                "turn": !isFirst,
                "shared_deck": newdeck
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
                    alert(`${payload.new["enemy"]}が対戦相手として見つかりました！`);
                    back();
                    setTimeout(() => {
                        window.location.href = "battle.html";
                    }, 1000);
                }
            }
        )
        .subscribe((status) => {
            console.log("サブスクリプションステータス:", status);
        });
}

async function join(){
    document.getElementById("wait").style.display = "none";
    document.getElementById("join").style.display = "none";
    document.getElementById("topback").style.display = "none";
    document.getElementById("joinRoom").style.display = "block";
    document.getElementById("back2").style.display = "block";
    const { data, error } = await supabase
    .from("waiters")
    .select("player, turn, shared_deck");
    // テーブル要素を作成
    const table = document.createElement("table");

    // ヘッダー行を追加
    const header = table.insertRow();
    const headerCell = document.createElement("th");
    headerCell.textContent = "対戦待ちユーザー";
    header.appendChild(headerCell);

let hakken = true;

    // 各ユーザー名を行として追加
    data.forEach((waiter) => {
    const row = table.insertRow();
    const cell = row.insertCell();
    cell.textContent = waiter.player + "　　　　";
    const newElement = document.createElement("button");
    newElement.textContent = "対戦";
    newElement.id = waiter.player;
    newElement.classList = "taisen";
    const id_ = newElement.id
    newElement.addEventListener("click", () => {
        if(hakken){
            localStorage.setItem("deck", JSON.stringify(waiter.shared_deck));
            localStorage.setItem("turn", waiter.turn);
            enemyLock(newElement.id);
            hakken = false;
            localStorage.setItem("reload", "none");
            setTimeout(() => {
                window.location.href = "battle.html";
            }, 1000);            
        }

    });
    cell.appendChild(newElement)
    });

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

