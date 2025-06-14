const supabase = window.supabase.createClient("https://ngvdppfzcgbkdtjlwbvh.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmRwcGZ6Y2dia2R0amx3YnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODU5NjMsImV4cCI6MjA2MzY2MTk2M30.6bVDy_sbtV4k_AvGeQ_aTtRhz4tBsJb2o_q8Y-OmwMA");

// ログインチェック
function nameExistCheck(){
    const Name = localStorage.getItem("username");
    if(Name !== null){
        document.getElementById("loginName").textContent = `${Name}としてログイン中`;
        document.getElementById("my-name").textContent = `${Name}`;        
    }else{
        window.location.href = "login.html";
    };
}
nameExistCheck();

// 対戦相手チェック
function enemyExistCheck(){
    const Enemy = localStorage.getItem("enemyname");
    if(Enemy !== null){
        document.getElementById("enemy-name").textContent = `${Enemy}`;
    }else{
        window.location.href = "search.html";
    }
}
enemyExistCheck();

// リロードチェック
function reloadCheck(){
    if(localStorage.getItem("reload") === "none"){
        localStorage.setItem("reload, "done");
    }else{
        window.location.href = "search.html";
    }
}
reloadCheck();

// 名前登録
const myName = localStorage.getItem("username");
const enemyName = localStorage.getItem("enemyname");
async function myNameDataCheck(){
    // 既に存在しているかチェック
    const { data, error } = await supabase
    .from("battles")
    .select("id") // 主キーなど一意に識別できるものを選択
    .eq("name", myName);

    // 存在していれば削除
    if (data.length > 0) {
    const { error: deleteError } = await supabase
        .from("battles")
        .delete()
        .eq("name", myName);

    if (deleteError) {
        console.error("削除エラー:", deleteError);
    } else {
        console.log("既存のデータを削除しました");
    }
    } else {
    console.log("同名のデータは存在しません");
    }    
}
myNameDataCheck();
(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { error: Error } = await supabase
        .from("battles")
        .insert([{ "name": myName }]);

    if (Error) {
        console.error("エラー:", Error);
        alert("通信に失敗しました。");
        return;
    }
})();

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
    // シャッフル（Fisher-Yatesアルゴリズム）
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    };
    return deck;
}
const deck = createDeck();

// 初手札６枚数字設定
document.body.classList.add("overlay");
let setCount = 0;
function firstHand(){
    document.querySelectorAll(".my-hand-number").forEach(first => {
        first.textContent = deck[setCount];
        setCount ++;
    })
}
firstHand();

// 先行後攻
const value = localStorage.getItem("turn");
if (value === "true") {
    Turn = true;
} else if (value === "false") {
    Turn = false;
} else {
    Turn = null;
}

// 相手のカードの数
let enemyCardLeftNumber = 0;
let enemyCardCenterNumber = 0;
let enemyCardRightNumber = 0;
let enemyShieldLeftNumber = 0;
let enemyShieldCenterNumber = 0;
let enemyShieldRightNumber = 0;

// 鍵管理
let senkou = true;
let action = true;
let charge = true;
let attack = true;
let tokkou = true;
let kougeki = true;
let change = true;
let shield = true;
let block = true;
let bouei = true;
let attackSelect = true;
let chargeSelect = true;
let tokkouSelect = true;
let shieldSelect = true;
let changeSelect = true;
let blockSelect = true;
let cardEmpty = true;
let boueijoutai = true;
let kougekijoutai = true;
let blockjoutai = true;
let damageFrom = "";
let taosareta = true;

// 対戦開始！
document.getElementById("message").style.display = "block";
setTimeout(() => {
    document.getElementById("message").style.display = "none";
}, 2000); 

// セットカード設定
let setcard = 0;
setTimeout(() => {
    document.querySelectorAll('.my-hand').forEach(hand => {
        hand.addEventListener('click', () => {
            if(setcard < 3 && !hand.classList.contains("selected")){
                hand.classList.remove("active");
                if(document.getElementById("my-card-left-number").textContent === ""){
                    document.getElementById("my-card-left-number").textContent = hand.textContent;
                    hand.classList.add("selected");
                }else if(document.getElementById("my-card-center-number").textContent === ""){
                    document.getElementById("my-card-center-number").textContent = hand.textContent;
                    hand.classList.add("selected");
                }else{
                    document.getElementById("my-card-right-number").textContent = hand.textContent;
                    document.getElementById("my-cards").style.display = "flex";
                    document.getElementById("enemy-cards").style.display = "flex";
                    document.getElementById("kougekikei").style.display = "flex";
                    document.getElementById("boueikei").style.display = "flex";
                    hand.classList.add("selected");
                    document.body.classList.remove("overlay");
                    vanishCard();
                    myCardRegister();
                    if(Turn){ // 先攻の場合
                        senkou = false;
                        myTurn();                   
                    }else{ // 後攻の場合
                        kougekiTeishi();
                        boueiTeishi();
                    };              
                };
                setcard++;
            }
        });
    });
}, 3000);
async function myCardRegister(){
    const left = document.getElementById("my-card-left-number").textContent.replace(/\s/g, "") === "JOKER" ? 100 : parseInt(document.getElementById("my-card-left-number").textContent.match(/\d+/)[0]);
    const center = document.getElementById("my-card-center-number").textContent.replace(/\s/g, "") === "JOKER" ? 100 : parseInt(document.getElementById("my-card-center-number").textContent.match(/\d+/)[0]);
    const right = document.getElementById("my-card-right-number").textContent.replace(/\s/g, "") === "JOKER" ? 100 : parseInt(document.getElementById("my-card-right-number").textContent.match(/\d+/)[0]);
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "set_card3": left,
            "set_card2": center,
            "set_card1": right
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}

// いらないカード消し
function vanishCard() {
    document.querySelectorAll(".selected").forEach(card => {
        card.remove();
    });
    document.querySelectorAll(".enemy-hand-dummy").forEach(card => {
        card.remove();
    });
    document.querySelectorAll(".my-hand").forEach(hand => {
        hand.classList.remove("active");
    });    
}

// チャージ構造　多分OK
document.getElementById("charge").addEventListener("click", function(){
    if(charge && action && kougeki){     
        document.querySelectorAll(".my-hand").forEach(hand => {
            if(hand.querySelector(".my-hand-number").textContent.replace(/\s/g, "") !== "JOKER"){
                hand.classList.add("active");
            };               
        });
        charge = false;
        action = false;
        document.getElementById("attack").style.display = "none";
        document.getElementById("tokkou").style.display = "none"; 
        document.body.classList.add("overlay");
    }else if(!charge && !action){
        conditionReset();
    };
})

// アタック構造　途中
document.getElementById("attack").addEventListener("click", function(){
    if(attack && action && kougeki){
        card1Check();
        card2Check();
        card3Check();
        let chargeJoutai = false;
        document.querySelectorAll(".my-card").forEach(card => {
            if((card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0] !== "0") && (card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER") && (card.querySelector(".my-block").style.display === "none")){
                card.classList.add("active");
                chargeJoutai = true;
            };
        });
        if(!chargeJoutai){
            alert("アタックできるセットカードがありません");
            return;
        };
        attack = false;
        action = false;
        document.getElementById("charge").style.display = "none";
        document.getElementById("tokkou").style.display = "none"; 
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else if(!attack && !action){
        conditionReset();
    };
})

// トッコウ構造　途中
document.getElementById("tokkou").addEventListener("click", function(){
    if(tokkou && action && kougeki){
        card1Check();
        card2Check();
        card3Check();
        document.querySelectorAll(".my-card").forEach(card => {
            if((card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER") && (card.querySelector(".my-block").style.display === "none")){
                card.classList.add("active"); 
            };              
        });
        tokkou = false;
        action = false;
        document.getElementById("charge").style.display = "none";
        document.getElementById("attack").style.display = "none"; 
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else if(!tokkou && !action){
        conditionReset();
    };
})

// チェンジ構造　多分OK
document.getElementById("change").addEventListener("click", function(){
    if(change && action && bouei){
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.add("active");                  
        });
        change = false;
        action = false;
        document.getElementById("shield").style.display = "none";
        document.getElementById("block").style.display = "none";      
        document.body.classList.add("overlay");       
    }else if(!change && !action){
        conditionReset();         
    };
})

// シールド構造　多分OK
document.getElementById("shield").addEventListener("click", function(){
    if(shield && action && bouei){
        let miniNumber = false;
        document.querySelectorAll(".my-hand-number").forEach(number => {
            if(number.textContent.replace(/\s/g, "") === "JOKER"){
            }else if(parseInt(number.textContent.match(/\d+/)[0]) === 1 || parseInt(number.textContent.match(/\d+/)[0]) === 2 || parseInt(number.textContent.match(/\d+/)[0]) === 3){
                number.parentElement.classList.add("miniNumber");      
                miniNumber = true;
            };
        });
        if(!miniNumber){
            alert("１〜３が手札にありません。")
            return;
        };
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.add("active");            
        });
        shield = false;
        action = false;
        document.getElementById("change").style.display = "none";
        document.getElementById("block").style.display = "none"; 
        document.body.classList.add("overlay");  
    }else if(!shield && !action){
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.remove("active");
            hand.classList.remove("miniNumber");            
        });        
        conditionReset();                
    };
})

// ブロック構造　多分OK
document.getElementById("block").addEventListener("click", function(){
    if(block && action && bouei){
        let miniNumber = false;
        document.querySelectorAll(".my-hand-number").forEach(number => {
            if(number.textContent.replace(/\s/g, "") === "JOKER"){
            }else if(parseInt(number.textContent.match(/\d+/)[0]) === 1 || parseInt(number.textContent.match(/\d+/)[0]) === 2 || parseInt(number.textContent.match(/\d+/)[0]) === 3){
                number.parentElement.classList.add("miniNumber");
                miniNumber = true;
            };
        });
        if(!miniNumber){
            alert("１〜３が手札にありません。")
            return;
        };
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.add("active");           
        });
        block = false;
        action = false;
        document.getElementById("change").style.display = "none";
        document.getElementById("shield").style.display = "none"; 
        document.body.classList.add("overlay");
    }else if(!block && !action){
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.remove("active");
            hand.classList.remove("miniNumber");          
        }); 
        conditionReset();     
    };
})

// 状態リセット
function conditionReset(){
    charge = true;
    attack = true;
    tokkou = true;
    change = true;
    shield = true;
    block = true;
    action =true;
    chargeSelect = true;
    attackSelect = true;
    tokkouSelect = true;
    changeSelect = true;
    shieldSelect = true;
    blockSelect = true;
    cardEmpty = true;
    document.getElementById("charge").style.display = "flex";
    document.getElementById("attack").style.display = "flex";
    document.getElementById("tokkou").style.display = "flex";
    document.getElementById("change").style.display = "flex";
    document.getElementById("shield").style.display = "flex";
    document.getElementById("block").style.display = "flex";         
    document.body.classList.remove("overlay");
    document.querySelectorAll(".my-hand").forEach(hand => {
        hand.classList.remove("active");   
    });  
    document.querySelectorAll(".my-card").forEach(card => {
        card.classList.remove("active");   
    });      
    document.querySelectorAll(".enemy-card").forEach(card => {
        card.classList.remove("active");    
        });       
    document.getElementById("main").style.backgroundColor = "#fff";
    if(document.querySelector(".selected")){
        document.querySelector(".selected").classList.remove("selected");  
    };      
}
// 自分の手札監視
document.querySelectorAll(".my-hand").forEach(hand => {
    hand.addEventListener("click", function(){
        if(!charge && chargeSelect && (hand.querySelector(".my-hand-number").textContent.replace(/\s/g, "") !== "JOKER")){ // チャージボタン有効状態　かつ　チャージ用カード選択前
            hand.querySelector("p").classList.add("selected");
            document.querySelectorAll(".my-hand").forEach(hand => {
                hand.classList.remove("active");    
            });
            document.querySelectorAll(".my-card").forEach(card => {
                card.classList.add("active");    
            });
            document.body.classList.remove("overlay");
            document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            chargeSelect = false;              
        }else if(!chargeSelect && (hand.querySelector(".my-hand-number").textContent.replace(/\s/g, "") !== "JOKER")){ // チャージ用カード選択後
            document.querySelector(".selected").classList.remove("selected");
            hand.querySelector("p").classList.add("selected");
        }else if(!shield && shieldSelect && (hand.classList.contains("miniNumber"))){ // シールド有効状態　かつ　シールド用カード選択前
            hand.querySelector("p").classList.add("selected");
            document.querySelectorAll(".my-hand").forEach(hand => {
                hand.classList.remove("active");    
            });
            document.querySelectorAll(".my-card").forEach(card => {
                card.classList.add("active");    
            });
            document.body.classList.remove("overlay");
            document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";            
            shieldSelect = false;                                  
        }else if(!shieldSelect && (hand.classList.contains("miniNumber"))){ // シールド用カード選択後
            document.querySelector(".selected").classList.remove("selected");
            hand.querySelector("p").classList.add("selected");            
        }else if(!change && changeSelect){ //　チェンジ有効状態　かつ　チェンジ用カード選択前
            hand.querySelector("p").classList.add("selected");
            document.querySelectorAll(".my-hand").forEach(hand => {
                hand.classList.remove("active");
            document.querySelectorAll(".my-card").forEach(card => {
                card.classList.add("active");    
            });
            document.body.classList.remove("overlay");
            document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            changeSelect = false;                    
            });            
        }else if(!changeSelect){ // チェンジ用カード選択後
            document.querySelector(".selected").classList.remove("selected");
            hand.querySelector("p").classList.add("selected");            
        }else if(!block && blockSelect && (hand.classList.contains("miniNumber"))){ // ブロック有効状態　かつ　ブロック用カード選択前
            hand.querySelector("p").classList.add("selected");
            document.querySelectorAll(".my-hand").forEach(hand => {
                hand.classList.remove("active");    
            });
            document.querySelectorAll(".enemy-card").forEach(card => {
                card.classList.add("active");    
            });
            document.body.classList.remove("overlay");
            document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";            
            blockSelect = false;             
        }else if(!blockSelect && (hand.classList.contains("miniNumber"))){ // ブロック用カード選択後
            document.querySelector(".selected").classList.remove("selected");
            hand.querySelector("p").classList.add("selected");              
        }else if(!cardEmpty || !taosareta){
            const newCard = hand.querySelector(".my-number").textContent;
            document.querySelectorAll(".my-card").forEach(card => {
                if(card.style.backgroundColor === "white"){
                    card.querySelector(".my-number").textContent = newCard;
                    card.style.backgroundColor = "rgb(206, 195, 229)";
                    if(card.classList.contains("card-left")){
                        card3Update(parseInt(newCard.match(/\d+/)[0]));
                    }else if(card.classList.contains("card-center")){
                        card2Update(parseInt(newCard.match(/\d+/)[0]));                        
                    }else{
                        card1Update(parseInt(newCard.match(/\d+/)[0]));                        
                    }
                };
            });
            hand.querySelector(".my-number").textContent = deck[setCount];
            setCount ++;
            if(!boueijoutai){
                bouei = true;
                document.getElementById("change").style.backgroundColor = "rgb(0, 34, 255)";  
                document.getElementById("shield").style.backgroundColor = "rgb(0, 34, 255)";
                document.getElementById("block").style.backgroundColor = "rgb(0, 34, 255)"; 
                boueijoutai = true;
            };
            if(!taosareta){
                kougeki = true;
                document.getElementById("charge").style.backgroundColor = "rgb(255, 0, 0)";  
                document.getElementById("attack").style.backgroundColor = "rgb(255, 0, 0)";
                document.getElementById("tokkou").style.backgroundColor = "rgb(255, 0, 0)"; 
                taosareta = true;
            }else{
                kougekiTeishi();
            }
            kougekijoutai = true;

            conditionReset();
        };
    });
})

// 自分のセットカード監視
document.querySelectorAll(".my-card").forEach(card => {
    card.addEventListener("click", function(){
        if(!chargeSelect){ // チャージ用カード選択後  // ↓チャージ合計がセットカードの数を超えていないかとJOKERの確認
            const chargeRyou = parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]) + parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]);
            if(card.querySelector(".my-number").textContent.replace(/\s/g, "") === "JOKER"){
                card.querySelector(".my-charge").querySelector("span").textContent = String(chargeRyou);
                card.querySelector(".my-charge").style.display = "flex";
                if(card.querySelector(".my-charge").id === "my-charge1"){
                    charge3Update(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]));
                }else if(card.querySelector(".my-charge").id === "my-charge2"){
                    charge2Update(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]));
                }else{
                    charge1Update(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]));
                }
                kougekiTeishi();
                document.querySelector(".selected").textContent = deck[setCount];
                setCount ++;
                conditionReset();            
            }else if(chargeRyou <= parseInt(card.querySelector(".my-number").textContent.match(/\d+/)[0])){           
                card.querySelector(".my-charge").querySelector("span").textContent = String(chargeRyou);
                card.querySelector(".my-charge").style.display = "flex";
                if(card.querySelector(".my-charge").id === "my-charge1"){
                    charge3Update(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]))
                }else if(card.querySelector(".my-charge").id === "my-charge2"){
                    charge2Update(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]))
                }else{
                    charge1Update(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]))
                }
                kougekiTeishi(); 
                document.querySelector(".selected").textContent = deck[setCount]; 
                setCount ++;
                conditionReset();
            }else{
                alert("セットカードの数を超えてしまいます");
            };
        }else if(!shieldSelect){ // シールド用カード選択後
            if(card.querySelector(".my-shield").querySelector("span").textContent === ""){
                card.querySelector(".my-shield").querySelector("span").textContent = String(parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]));
                card.querySelector(".my-shield").style.display = "flex";
                if(card.querySelector(".my-shield").id === "my-shield1"){
                    guard3Update(parseInt(card.querySelector(".my-shield").querySelector("span").textContent.match(/\d+/)[0]));
                }else if(card.querySelector(".my-shield").id === "my-shield2"){
                    guard2Update(parseInt(card.querySelector(".my-shield").querySelector("span").textContent.match(/\d+/)[0]));
                }else{
                    guard1Update(parseInt(card.querySelector(".my-shield").querySelector("span").textContent.match(/\d+/)[0]));
                }
                boueiTeishi();
                document.querySelector(".selected").textContent = deck[setCount]; 
                setCount ++;
                conditionReset();                                                    
            };
        }else if(!changeSelect){ // チェンジ用カード選択後
            card.querySelector(".my-number").textContent = document.querySelector(".selected").textContent;
            shieldDelete(card.querySelector(".my-shield"));
            chargeDelete(card.querySelector(".my-charge"));
            if(card.querySelector(".my-number").id === "my-card-left-number"){
                const newCard = card.querySelector(".my-number").textContent.replace(/\s/g, "") === "JOKER" ? 100 : parseInt(card.querySelector(".my-number").textContent.match(/\d+/)[0]);
                card3Update(newCard);
                guard3Update(0);
                charge3Update(0);
            }else if(card.querySelector(".my-number").id === "my-card-center-number"){
                const newCard = card.querySelector(".my-number").textContent.replace(/\s/g, "") === "JOKER" ? 100 : parseInt(card.querySelector(".my-number").textContent.match(/\d+/)[0]);
                card2Update(newCard);
                guard2Update(0);
                charge2Update(0);                
            }else{
                const newCard = card.querySelector(".my-number").textContent.replace(/\s/g, "") === "JOKER" ? 100 : parseInt(card.querySelector(".my-number").textContent.match(/\d+/)[0]);
                card1Update(newCard);
                guard1Update(0);
                charge1Update(0);                
            }
            boueiTeishi();            
            document.querySelector(".selected").textContent = deck[setCount]; 
            setCount ++;
            conditionReset();        
        }else if(!attack && attackSelect){ // アタック有効状態　かつ　アタック用カード選択前
            if((card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0] !== "0") && (card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER") && (card.querySelector(".my-block").style.display === "none")){
                document.querySelectorAll(".active").forEach(card => {
                    card.classList.remove("active");
                });
                card.querySelector(".my-number").classList.add("selected");
                document.querySelectorAll(".enemy-card").forEach(card => {
                    card.classList.add("active");                    
                });
                attackSelect = false;
                if(card.classList.contains("card-left")){
                    damageFrom = "attack3";
                }else if(card.classList.contains("card-center")){
                    damageFrom = "attack2";
                }else{
                    damageFrom = "attack1";
                };
            };
        }else if(!attackSelect){ // アタック用カード選択後
            if((card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0] !== "0") && (card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER") && (card.querySelector(".my-block").style.display === "none")){
                document.querySelector(".selected").classList.remove("selected");
                card.querySelector(".my-number").classList.add("selected");
                if(card.classList.contains("card-left")){
                    damageFrom = "attack3";
                }else if(card.classList.contains("card-center")){
                    damageFrom = "attack2";
                }else{
                    damageFrom = "attack1";
                };
            };
        }else if(!tokkou && tokkouSelect){ // トッコウ有効状態　かつ　トッコウ用カード選択前
            if((card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER") && (card.querySelector(".my-block").style.display === "none")){
                document.querySelectorAll(".active").forEach(card => {
                    card.classList.remove("active");
                });
                card.querySelector(".my-number").classList.add("selected");
                document.querySelectorAll(".enemy-card").forEach(card => {
                    card.classList.add("active");
                });
                tokkouSelect = false;
                if(card.classList.contains("card-left")){
                    damageFrom = "tokkou3"
                }else if(card.classList.contains("card-center")){
                    damageFrom = "tokkou2"
                }else{
                    damageFrom = "tokkou1"
                };                
            };
        }else if(!tokkouSelect){ // トッコウ用カード選択後
            if((card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER") && (card.querySelector(".my-block").style.display === "none")){
                document.querySelector(".selected").classList.remove("selected");
                card.querySelector(".my-number").classList.add("selected");
                if(card.classList.contains("card-left")){
                    damageFrom = "tokkou3"
                }else if(card.classList.contains("card-center")){
                    damageFrom = "tokkou2"
                }else{
                    damageFrom = "tokkou1"
                };       
            };               
        };
    });
})

// 相手のセットカード監視
document.querySelectorAll(".enemy-card").forEach(card => {
    card.addEventListener("click", function(){ 
        if(!blockSelect){ // ブロック用カード選択後
            if(card.querySelector(".enemy-block").style.display === "none"){
                card.querySelector(".enemy-block").style.display = "flex";
                if(card.querySelector(".enemy-block").id === "enemy-block1"){
                    blockUpdate(3);
                }else if(card.querySelector(".enemy-block").id === "enemy-block2"){
                    blockUpdate(2);
                }else{
                    blockUpdate(1);
                }
                document.querySelector(".selected").textContent = deck[setCount];
                setCount ++;
                blockjoutai = false;
                conditionReset();
                boueiTeishi();
            };
        }else if(!attackSelect){ // アタック用カード選択後
            const chargeRyou = parseInt(document.querySelector(".selected").parentElement.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]);
            if(card.querySelector(".my-number").classList.contains("enemy-card-left-number")){
                if(enemyCardLeftNumber + enemyShieldLeftNumber <= chargeRyou){
                    alert("attack succeeded");
                    myPoint();
                    document.getElementById("enemy-card-left").style.background = "white";
                    damagePattern(damageFrom + "_card3_succeeded", chargeRyou);
                }else if(enemyCardLeftNumber === 100){
                    alert("this is JOKER");
                    shieldDelete(document.querySelector(".selected").parentElement.querySelector(".my-shield"));
                    kougekijoutai = false;
                    enemyPoint();
                    kougekiTeishi();
                    document.querySelector(".selected").parentElement.style.backgroundColor = "white"; 
                    document.querySelector(".selected").textContent = "";
                    conditionReset();
                    cardAdd();
                    damagePattern(damageFrom + "_card3_failed_JOKER", chargeRyou);
                }else{

                    alert("attack failed");
                    damagePattern(damageFrom + "_card3_failed", chargeRyou);
                };
                document.getElementById("enemy-shield1").style.display = "none";
                document.getElementById("enemy-shield1").querySelector("span").textContent = "";
                chargeDelete(document.querySelector(".selected").parentElement.querySelector(".my-charge"));
                charge3Update(0);
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-center-number")){
                if(enemyCardCenterNumber + enemyShieldCenterNumber <= chargeRyou){
                    alert("attack succeeded");
                    myPoint();
                    document.getElementById("enemy-card-center").style.background = "white";
                    damagePattern(damageFrom + "_card2_succeeded", chargeRyou);
                }else if(enemyCardCenterNumber === 100){
                    alert("this is JOKER");
                    shieldDelete(document.querySelector(".selected").parentElement.querySelector(".my-shield"));
                    kougekijoutai = false;
                    enemyPoint();
                    kougekiTeishi();
                    document.querySelector(".selected").parentElement.style.backgroundColor = "white"; 
                    document.querySelector(".selected").textContent = "";
                    conditionReset();
                    cardAdd();
                    damagePattern(damageFrom + "_card2_failed_JOKER", chargeRyou);
                }else{

                    alert("attack failed");
                    damagePattern(damageFrom + "_card2_failed", chargeRyou);                    
                };
                document.getElementById("enemy-shield2").style.display = "none";
                document.getElementById("enemy-shield2").querySelector("span").textContent = "";
                chargeDelete(document.querySelector(".selected").parentElement.querySelector(".my-charge"));
                charge2Update(0);
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-right-number")){
                if(enemyCardRightNumber + enemyShieldRightNumber <= chargeRyou){
                    alert("attack succeeded");
                    myPoint();
                    document.getElementById("enemy-card-right").style.background = "white";
                    damagePattern(damageFrom + "_card1_succeeded", chargeRyou);
                }else if(enemyCardRightNumber === 100){
                    alert("this is JOKER");
                    shieldDelete(document.querySelector(".selected").parentElement.querySelector(".my-shield"));
                    kougekijoutai = false;
                    enemyPoint();
                    kougekiTeishi();
                    document.querySelector(".selected").parentElement.style.backgroundColor = "white"; 
                    document.querySelector(".selected").textContent = "";
                    conditionReset();
                    cardAdd(); 
                    damagePattern(damageFrom + "_card1_failed_JOKER", chargeRyou);
                }else{

                    alert("attack failed");
                    damagePattern(damageFrom + "_card1_failed", chargeRyou);                  
                };
                document.getElementById("enemy-shield3").style.display = "none";
                document.getElementById("enemy-shield3").querySelector("span").textContent = "";
                chargeDelete(document.querySelector(".selected").parentElement.querySelector(".my-charge"));
                charge1Update(0);
            };
            kougekiTeishi();
            conditionReset();
        }else if(!tokkouSelect){ // トッコウ用カード選択後
            const tokkouNumber = parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]);
            if(card.querySelector(".my-number").classList.contains("enemy-card-left-number")){
                if(enemyCardLeftNumber + enemyShieldLeftNumber <= tokkouNumber){
                    alert(enemyCardLeftNumber + enemyShieldLeftNumber);
                    myPoint();
                    document.getElementById("enemy-charge3").style.display = "none";
                    document.getElementById("enemy-charge3").textContent = "0";  
                    damagePattern(damageFrom + "_card3_succeeded", tokkouNumber);
                }else if(enemyCardLeftNumber === 100){
                    alert("this is JOKER");
                    damagePattern(damageFrom + "_card3_failed_JOKER", tokkouNumber);
                }else{
                    alert("tokkou failed");
                    damagePattern(damageFrom + "_card3_failed", tokkouNumber);
                };
                document.getElementById("enemy-shield1").style.display = "none";
                document.getElementById("enemy-shield1").textContent = "";
                document.getElementById("enemy-card-left").style.background = "white";
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-center-number")){
                if(enemyCardCenterNumber + enemyShieldCenterNumber <= tokkouNumber){
                    alert("tokkou succeeded");               
                    myPoint();
                    document.getElementById("enemy-charge3").style.display = "none";
                    document.getElementById("enemy-charge3").textContent = "0";  
                    damagePattern(damageFrom + "_card2_succeeded", tokkouNumber);
                }else if(enemyCardCenterNumber === 100){
                    alert("this is JOKER");
                    damagePattern(damageFrom + "_card2_failed_JOKER", tokkouNumber);
                }else{
                    alert("tokkou failed");
                    damagePattern(damageFrom + "_card2_failed", tokkouNumber);
                };
                document.getElementById("enemy-shield2").style.display = "none";
                document.getElementById("enemy-shield2").textContent = "";
                document.getElementById("enemy-card-center").style.background = "white";
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-right-number")){
                if(enemyCardRightNumber + enemyShieldRightNumber <= tokkouNumber){
                    alert("tokkou succeeded");
                    myPoint();
                    document.getElementById("enemy-charge3").style.display = "none";
                    document.getElementById("enemy-charge3").textContent = "0";                    
                    damagePattern(damageFrom + "_card1_succeeded", tokkouNumber);
                }else if(enemyCardRightNumber === 100){
                    alert("this is JOKER")
                    damagePattern(damageFrom + "_card1_failed_JOKER", tokkouNumber);
                }else{
                    alert("tokkou failed");
                    damagePattern(damageFrom + "_card1_failed", tokkouNumber);
                }; 
                document.getElementById("enemy-shield3").style.display = "none";
                document.getElementById("enemy-shield3").textContent = "";
                document.getElementById("enemy-card-right").style.background = "white";
            }; 
            kougekijoutai = false;
            enemyPoint();
            kougekiTeishi();
            shieldDelete(document.querySelector(".selected").parentElement.querySelector(".my-shield"));
            chargeDelete(document.querySelector(".selected").parentElement.querySelector(".my-charge"));
            document.querySelector(".selected").parentElement.style.backgroundColor = "white"; 
            document.querySelector(".selected").textContent = "";
            conditionReset();
            cardAdd();          
        };
    });
});

// シールド削除
function shieldDelete(dore){
    dore.style.display = "none";
    dore.querySelector("span").textContent = "";    
}

// チャージ削除
function chargeDelete(dore){
    dore.querySelector("span").textContent = "0";
    dore.style.display = "none";
}

// カード追加
async function cardAdd(){
    document.querySelectorAll(".my-card").forEach(card => {
        if(card.querySelector(".my-number").textContent === ""){
            document.querySelectorAll(".my-hand").forEach(hand => {
                hand.classList.add("active");
            });
            cardEmpty = false;
            if(bouei){
                bouei = false;
                boueijoutai = false;
            };
            if(kougeki){
                kougeki = false;
                taosareta = false;
                document.getElementById("charge").style.backgroundColor = "rgba(0, 0, 0, 0.5)";  
                document.getElementById("attack").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                document.getElementById("tokkou").style.backgroundColor = "rgba(0, 0, 0, 0.5)"; 
            }
            document.getElementById("change").style.backgroundColor = "rgba(0, 0, 0, 0.5)";  
            document.getElementById("shield").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            document.getElementById("block").style.backgroundColor = "rgba(0, 0, 0, 0.5)"; 
        };
    });
}

// 自分の点数確認
function myPoint(){
    myPointUpdate(parseInt(document.getElementById("my-point").textContent) + 1);
    document.getElementById("my-point").textContent = String(parseInt(document.getElementById("my-point").textContent) + 1);
    if(parseInt(document.getElementById("my-point").textContent) >= 3){
        alert("あなたの勝ちです");
    }    
}
// 相手の点数確認
function enemyPoint(){
    document.getElementById("enemy-point").textContent = String(parseInt(document.getElementById("enemy-point").textContent) + 1)
}

// 攻撃停止
function kougekiTeishi(){
    document.getElementById("charge").style.display = "flex";
    document.getElementById("attack").style.display = "flex";
    document.getElementById("tokkou").style.display = "flex";
    document.getElementById("charge").style.backgroundColor = "rgba(0, 0, 0, 0.5)";  
    document.getElementById("attack").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    document.getElementById("tokkou").style.backgroundColor = "rgba(0, 0, 0, 0.5)";    
    kougeki = false;
    if(!bouei && kougekijoutai){
        enemyTurn();
    }
}

// 防衛停止
function boueiTeishi(){
    document.getElementById("change").style.display = "flex";
    document.getElementById("shield").style.display = "flex";
    document.getElementById("block").style.display = "flex";    
    document.getElementById("change").style.backgroundColor = "rgba(0, 0, 0, 0.5)";  
    document.getElementById("shield").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    document.getElementById("block").style.backgroundColor = "rgba(0, 0, 0, 0.5)";    
    bouei = false;
    if(!kougeki){
        enemyTurn();     
    }
}

// 復活
function hukkatsu(){
    myTurn();
    document.getElementById("charge").style.backgroundColor = "rgb(255, 0, 0)";  
    document.getElementById("attack").style.backgroundColor = "rgb(255, 0, 0)";
    document.getElementById("tokkou").style.backgroundColor = "rgb(255, 0, 0)"; 
    document.getElementById("change").style.backgroundColor = "rgb(0, 34, 255)";  
    document.getElementById("shield").style.backgroundColor = "rgb(0, 34, 255)";
    document.getElementById("block").style.backgroundColor = "rgb(0, 34, 255)"; 
    kougeki = true;
    bouei = true;
}

// 自分のターン
function myTurn(){
    if(!blockjoutai){
        document.querySelectorAll(".enemy-block").forEach(burokku => {
            burokku.style.display = "none";
        });
        blockjoutai = true;
        blockUpdate(0);
    }
    document.getElementById("enemy-card-left").style.background = "linear-gradient(145deg, rgb(180, 161, 222), rgb(123, 54, 183)";
    document.getElementById("enemy-card-center").style.background = "linear-gradient(145deg, rgb(180, 161, 222), rgb(123, 54, 183)";
    document.getElementById("enemy-card-right").style.background = "linear-gradient(145deg, rgb(180, 161, 222), rgb(123, 54, 183)";
    enemyUpdate();
    damagePattern("", 0);
    document.getElementById("message").classList.remove("enemy-turn");
    document.getElementById("message").textContent = "自分のターン";
    document.getElementById("message").style.display = "block";
    setTimeout(() => {
        document.getElementById("message").style.display = "none";
    }, 2000);    
}

// 相手のターン中
function enemyTurn(){
    document.getElementById("my-block1").style.display = "none";
    document.getElementById("my-block2").style.display = "none";
    document.getElementById("my-block3").style.display = "none";
    turnUpdate();
    document.getElementById("message").textContent = "相手のターン中";
    document.getElementById("message").classList.add("enemy-turn");
    document.getElementById("message").style.display = "block";
    machi();
}

// ターン情報更新
async function turnUpdate(){
    const { data, error: fetchError } = await supabase
    .from("battles")
    .select("turn")
    .eq("name", enemyName)
    .single();

    if (fetchError) {
    console.error("取得エラー:", fetchError);
    return;
    }

    const newValue = !data.turn;

    const { error: updateError } = await supabase
    .from("battles")
    .update({ "turn": newValue })
    .eq("name", enemyName);

    if (updateError) {
    console.error("更新エラー:", updateError);
    } 
}

// 自分のポイント更新
async function myPointUpdate(point){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "point": point
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}

// 自分のセットカード更新
function setCard(card){
    if(card.querySelector(".my-number").classList.contains("my-card-left-number")){
        card3Check()
    }
}
async function card1Update(right){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "set_card1": right
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}
async function card2Update(center){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "set_card2": center
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}
async function card3Update(left){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "set_card3": left
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}

// 自分のチャージ更新
async function charge1Update(right){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "charge_card1": right
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}
async function charge2Update(center){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "charge_card2": center
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}
async function charge3Update(left){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "charge_card3": left
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}

// 自分のシールド更新
async function guard1Update(right){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "guard_card1": right
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}
async function guard2Update(center){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "guard_card2": center
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}
async function guard3Update(left){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "guard_card3": left
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}

// 相手に対するブロック情報更新
async function blockUpdate(blockNumber){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "block": blockNumber
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }    
}

// 相手のセットカード確認
async function card1Check(){
    const { data, error } = await supabase
    .from("battles")
    .select("set_card1")
    .eq("name", enemyName)
    .single();

    if (error) {
    console.error("取得エラー:", error);
    };

    enemyCardLeftNumber = data.set_card1;
}
async function card2Check(){
    const { data, error } = await supabase
    .from("battles")
    .select("set_card2")
    .eq("name", enemyName)
    .single();

    if (error) {
    console.error("取得エラー:", error);
    };

    enemyCardCenterNumber = data.set_card2;
}
async function card3Check(){
    const { data, error } = await supabase
    .from("battles")
    .select("set_card3")
    .eq("name", enemyName)
    .single();

    if (error) {
    console.error("取得エラー:", error);
    };

    enemyCardRightNumber = data.set_card3;
}  

// ダメージパターン登録
async function damagePattern(syurui, okisa){
    const { error } = await supabase
    .from("battles")
    .update(
        {
            "damage_pattern": syurui,
            "damage": okisa
        })
    .eq("name", myName);

    if (error) {
    console.error("更新エラー:", error);
    }
}

// 相手の情報更新
let nanikara = "";
let nanini = "";
let dounatta = "";
async function enemyUpdate(){
    const { data, error } = await supabase
    .from("battles")
    .select("guard_card1, guard_card2, guard_card3, charge_card1, charge_card2, charge_card3, block, point, damage, damage_pattern")
    .eq("name", enemyName)
    .single();
    if (error) {
    console.error("取得エラー:", error);
    };

    enemyShieldLeftNumber = data.guard_card1;
    enemyShieldCenterNumber = data.guard_card2;
    enemyShieldRightNumber = data.guard_card3;
    document.getElementById("enemy-point").textContent = String(data.point);
    if(data.point >= 3){
        alert("あなたの負けです");
    };
    if(data.guard_card1 > 0){
        document.getElementById("enemy-shield1").querySelector("span").textContent = String(data.guard_card1);
        document.getElementById("enemy-shield1").style.display = "flex";        
    }else{
        document.getElementById("enemy-shield1").style.display = "none";  
    };
    if(data.guard_card2 > 0){
        document.getElementById("enemy-shield2").querySelector("span").textContent = String(data.guard_card2);
        document.getElementById("enemy-shield2").style.display = "flex"; 
    }else{
        document.getElementById("enemy-shield2").style.display = "none";  
    };
    if(data.guard_card3 > 0){
        document.getElementById("enemy-shield3").querySelector("span").textContent = String(data.guard_card3);
        document.getElementById("enemy-shield3").style.display = "flex";  
    }else{
        document.getElementById("enemy-shield3").style.display = "none";  
    };
    if(data.charge_card1 > 0){
        document.getElementById("enemy-charge1").style.display = "flex";
    }else{
        document.getElementById("enemy-charge1").style.display = "none";        
    };
    if(data.charge_card2 > 0){
        document.getElementById("enemy-charge2").style.display = "flex";
    }else{
        document.getElementById("enemy-charge2").style.display = "none";
    };
    if(data.charge_card3 > 0){
        document.getElementById("enemy-charge3").style.display = "flex";
    }else{
        document.getElementById("enemy-charge3").style.display = "none";
    };
    if(data.block === 1){
        document.getElementById("my-block1").style.display = "flex";
    }else if(data.block === 2){
        document.getElementById("my-block2").style.display = "flex";        
    }else if(data.block === 3){
        document.getElementById("my-block3").style.display = "flex";
    };
    if(data.damage_pattern.includes("attack1")){
        nanikara = "左のセットカードからアタックされ"
        naniniCheck();
    }else if(data.damage_pattern.includes("attack2")){
        nanikara = "中央のセットカードからアタックされ";
    }else if(data.damage_pattern.includes("attack3")){
        nanikara = "右のセットカードからアタックされ";
    }else if(data.damage_pattern.includes("tokkou1")){
        nanikara = "左のセットカードからトッコウされ";
    }else if(data.damage_pattern.includes("tokkou2")){
        nanikara = "中央のセットカードからトッコウされ";
    }else if(data.damage_pattern.includes("tokkou3")){
        nanikara = "右のセットカードからトッコウされ";
    };
    if(data.damage_pattern.includes("card1")){
        nanini = "左のセットカードに";
    }else if(data.damage_pattern.includes("card2")){
        nanini = "中央のセットカードに";
    }else if(data.damage_pattern.includes("card3")){
        nanini = "右のセットカードに";
    };
    if(data.damage_pattern.includes("succeeded")){
        dounatta = "のダメージで倒されました";
        if(nanini.includes("左")){
            document.getElementById("my-card-left-number").textContent = "";
            document.getElementById("my-card-left-number").parentElement.style.backgroundColor = "white";
            cardAdd();
        }else if(nanini.includes("中央")){
            document.getElementById("my-card-center-number").textContent = "";
            document.getElementById("my-card-center-number").parentElement.style.backgroundColor = "white";
            cardAdd();
        }else if(nanini.includes("右")){
            document.getElementById("my-card-right-number").textContent = "";
            document.getElementById("my-card-right-number").parentElement.style.backgroundColor = "white";
            cardAdd();
        };
        alert(nanini + nanikara + String(data.damage) + dounatta);
    }else if(data.damage_pattern.includes("failed")){
        dounatta = "のダメージに耐えました";
        alert(nanini + nanikara + String(data.damage) + dounatta);
    };
    if(data.damage_pattern.includes("JOKER")){
        myPoint();
        if(nanini.includes("左")){
            document.getElementById("my-card-left-number").textContent = "";
            cardAdd();
        }else if(nanini.includes("中央")){
            document.getElementById("my-card-center-number").textContent = "";    
            cardAdd();
        }else if(nanini.includes("右")){
            document.getElementById("my-card-right-number").textContent = "";
            cardAdd();
        };
        alert("JOKERに対する接触だったため一点入ります")
    }
}


// ターン待ち
let realtimeChannel = null;
async function machi(){
    realtimeChannel = supabase
        .channel("my_channel")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "battles",
                filter: `name=eq.${myName}`,
            },
            (payload) => {
                console.log("🔥 変更検知payload:", payload);
                if (payload.old && payload.new) {
                    console.log("旧:", payload.old.turn, "新:", payload.new.turn);
                    if (payload.old["turn"] !== payload.new["turn"]) {
                        console.log("▶ turnが変化したのでhukkatsu呼び出し");
                        hukkatsu();
                        teishi();
                    }
                }
            }
        )
        .subscribe((status) => {
            console.log("サブスクリプションステータス:", status);
        });
}
async function teishi(){
    if (realtimeChannel) {
        await supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }    
}
