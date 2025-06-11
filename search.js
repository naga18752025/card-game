const supabase = window.supabase.createClient("https://ngvdppfzcgbkdtjlwbvh.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmRwcGZ6Y2dia2R0amx3YnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODU5NjMsImV4cCI6MjA2MzY2MTk2M30.6bVDy_sbtV4k_AvGeQ_aTtRhz4tBsJb2o_q8Y-OmwMA");

async function wait(){
    const name = localStorage.getItem("username");
    const { error: Error } = await supabase
        .from("waiters")
        .insert([{ player: name }]);

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

    // リアルタイムチャネルを購読
    const channel = supabase
        .channel('my_channel') // 任意のチャネル名
        .on(
        'postgres_changes',
        { 
            event: 'UPDATE', // 更新イベントを監視
            schema: 'public', // スキーマ名 (通常は 'public')
            table: "waiters", 
            filter: `player=eq.${name}` // 特定のIDを持つレコードにフィルター
        },
        (payload) => {
            if (payload.old && payload.new && payload.old["enemy"] !== payload.new["enemy"]) {
                const oldValue = payload.old["enemy"];
                const newValue = payload.new["enemy"];

                // ここでalertを表示
                alert(`${payload.new["enemy"]}が対戦相手として見つかりました！`);
                supabase.unsubscribe();
            }
        }
    )
    .subscribe();
}

async function join(){
    document.getElementById("wait").style.display = "none";
    document.getElementById("join").style.display = "none";
    document.getElementById("topback").style.display = "none";
    document.getElementById("joinRoom").style.display = "block";
    document.getElementById("back2").style.display = "block";
    const { data, error } = await supabase
    .from("waiters")
    .select("player");
    const players = data.map(waiter => waiter.player);
    // テーブル要素を作成
    const table = document.createElement("table");

    // ヘッダー行を追加
    const header = table.insertRow();
    const headerCell = document.createElement("th");
    headerCell.textContent = "対戦待ちユーザー";
    header.appendChild(headerCell);

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
        enemyLock(newElement.id);
    });
    cell.appendChild(newElement)
    });

  // 表を指定のdivに追加
    const container = document.getElementById("joinRoom");
    container.innerHTML = ""; // 一度クリア（重複防止）
    container.appendChild(table);
}

async function back(){
    document.getElementById("wait").style.display = "block";
    document.getElementById("join").style.display = "block";
    document.getElementById("topback").style.display = "block";
    document.getElementById("waitRoom").style.display = "none";
    document.getElementById("joinRoom").style.display = "none";
    document.getElementById("back").style.display = "none";
    const name = localStorage.getItem("username");
    const { error } = await supabase
        .from('waiters')
        .delete()
        .eq('player', name);
    supabase.unsubscribe();
}

function back2(){
    document.getElementById("wait").style.display = "block";
    document.getElementById("join").style.display = "block";
    document.getElementById("topback").style.display = "block"
    document.getElementById("waitRoom").style.display = "none";
    document.getElementById("joinRoom").style.display = "none";
    document.getElementById("back2").style.display = "none";
}

async function enemyLock(id_){
    const name = localStorage.getItem("username");
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
    if(Name.length <1){
        window.location.href = "login.html";
    }else{
        document.getElementById("loginName").textContent = `${Name}としてログイン中`;
    };
}

nameExistCheck()
