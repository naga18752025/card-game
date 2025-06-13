// ログインチェック
function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name !== null){
        document.getElementById("loginName").textContent = `${Name}としてログイン中`;
        document.getElementById("my-name").textContent = `${Name}`;        
    }else{
        window.location.href = "login.html";
    };
}

nameExistCheck();


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

let setCount = 0;


// 初手札６枚数字設定
function firstHand(){
    document.querySelectorAll(".my-hand-number").forEach(first => {
        first.textContent = deck[setCount];
        setCount ++;
    })
}

firstHand();

// 相手のセットカードの数
let enemyCardLeftNumber = 1;
let enemyCardCenterNumber = 10;
let enemyCardRightNumber = 10;


// 鍵管理
let action = true;
let charge = true;
let attack = true;
let tokkou = true;
let kougeki = true;
let change = true;
let shield = true;
let block = true;
let bouei = true;

const cells = document.querySelectorAll('.my-hand');

document.body.classList.add("overlay");


// 対戦開始！
document.getElementById("message").style.display = "block";

// 数秒後に自動で消す
setTimeout(() => {
    document.getElementById("message").style.display = "none";
}, 2000); // 2秒後に非表示


// セットカード設定
let setcard = 0;

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if(setcard < 3 && !cell.classList.contains("selected")){
            cell.classList.remove("active");
            if(document.getElementById("my-card-left-number").textContent === ""){
                document.getElementById("my-card-left-number").textContent = cell.textContent;
                cell.classList.add("selected");
            }else if(document.getElementById("my-card-center-number").textContent === ""){
                document.getElementById("my-card-center-number").textContent = cell.textContent;
                cell.classList.add("selected");
            }else{
                document.getElementById("my-card-right-number").textContent = cell.textContent;
                document.getElementById("my-cards").style.display = "flex";
                document.getElementById("enemy-cards").style.display = "flex";
                document.getElementById("kougekikei").style.display = "flex";
                document.getElementById("boueikei").style.display = "flex";
                cell.classList.add("selected");
                document.body.classList.remove("overlay");
                vanishCard();
                document.getElementById("message").textContent = "自分のターン";
                document.getElementById("message").style.display = "block";
                // 数秒後に自動で消す
                setTimeout(() => {
                    document.getElementById("message").style.display = "none";
                }, 2000); // 2秒後に非表示               
            };
            setcard++;
        }

    });
});

// いらないカード消し
function vanishCard() {
    document.querySelectorAll(".selected").forEach(card => {
        card.remove();
    });
    document.querySelectorAll(".enemy-hand-dummy").forEach(card => {
        card.remove();
    });
    document.querySelectorAll(".my-hand").forEach(hand => {
        hand.classList.remove("active")
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
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.remove("active");                
        });
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");    
        });
        charge = true; 
        action = true; 
        chargeSelect = true;  
        document.getElementById("attack").style.display = "flex";
        document.getElementById("tokkou").style.display = "flex";        
        document.body.classList.remove("overlay");
        document.getElementById("main").style.backgroundColor = "#fff";
        if(document.querySelector(".selected")){
            document.querySelector(".selected").classList.remove("selected");  
        };  
    };
})

// アタック構造　途中
document.getElementById("attack").addEventListener("click", function(){
    if(attack && action && kougeki){
        let chargeRyou = false;
        document.querySelectorAll(".my-card").forEach(card => {
            if((card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0] !== "0") && (card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER")){
                card.classList.add("active");
                chargeRyou = true;
            }    
        });
        if(!chargeRyou){
            alert("アタックできるセットカードがありません");
            return;
        }
        attack = false;
        action = false;
        document.getElementById("charge").style.display = "none";
        document.getElementById("tokkou").style.display = "none"; 
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else if(!attack && !action){
        document.querySelectorAll(".my-card").forEach(shield => {
            shield.classList.remove("active");
            
        }); 
        attack = true;
        action = true;
        attackSelect = true;
        document.getElementById("charge").style.display = "flex";
        document.getElementById("tokkou").style.display = "flex";       
        document.body.classList.remove("overlay");
        document.getElementById("main").style.backgroundColor = "#fff";
        document.querySelectorAll(".enemy-card").forEach(card => {
            card.classList.remove("active");
        });
        if(document.querySelector(".selected")){
            document.querySelector(".selected").classList.remove("selected");  
        };  
    };
})

// トッコウ構造
document.getElementById("tokkou").addEventListener("click", function(){
    if(tokkou && action && kougeki){
        document.querySelectorAll(".my-card").forEach(card => {
            if(card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER"){
                card.classList.add("active"); 
            }
                
        });
        tokkou = false;
        action = false;
        document.getElementById("charge").style.display = "none";
        document.getElementById("attack").style.display = "none"; 
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else if(!tokkou && !action){
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");
            
        }); 
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.remove("active");   
        }); 
        tokkou = true;
        action = true;  
        tokkouSelect = true;          
        document.getElementById("charge").style.display = "flex";
        document.getElementById("attack").style.display = "flex"; 
        document.body.classList.remove("overlay");
        document.getElementById("main").style.backgroundColor = "#fff";
        document.querySelectorAll(".enemy-card").forEach(card => {
            card.classList.remove("active");
        });        
        if(document.querySelector(".selected")){
            document.querySelector(".selected").classList.remove("selected");  
        };               
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
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");                       
        });
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.remove("active");   
        });  
        change = true;
        action = true;       
        changeSelect = true;
        document.getElementById("shield").style.display = "flex";
        document.getElementById("block").style.display = "flex";   
        document.body.classList.remove("overlay");
        document.getElementById("main").style.backgroundColor = "#fff";
        if(document.querySelector(".selected")){
            document.querySelector(".selected").classList.remove("selected");  
        };             
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
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");   
        });  
        shield = true;
        action = true;         
        shieldSelect = true;      
        document.getElementById("change").style.display = "flex";
        document.getElementById("block").style.display = "flex";  
        document.body.classList.remove("overlay");
        document.getElementById("main").style.backgroundColor = "#fff";
        if(document.querySelector(".selected")){
            document.querySelector(".selected").classList.remove("selected");  
        };                    
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
        document.querySelectorAll(".enemy-card").forEach(card => {
            card.classList.remove("active");    
            });       
        block = true;
        action = true;
        blockSelect = true;
        document.getElementById("change").style.display = "flex";
        document.getElementById("shield").style.display = "flex";         
        document.body.classList.remove("overlay");
        document.getElementById("main").style.backgroundColor = "#fff";
        if(document.querySelector(".selected")){
            document.querySelector(".selected").classList.remove("selected");  
        };        
    };
})

// 監視用鍵管理
attackSelect = true;
chargeSelect = true;
tokkouSelect = true;
shieldSelect = true;
changeSelect = true;
blockSelect = true;


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
        };
    });
})

// 自分のセットカード監視
document.querySelectorAll(".my-card").forEach(card => {
    card.addEventListener("click", function(){
        if(!chargeSelect){ // チャージ用カード選択後  // ↓チャージ合計がセットカードの数を超えていないかとJOKERの確認
            if(card.querySelector(".my-number").textContent.replace(/\s/g, "") === "JOKER"){
                card.querySelector(".my-charge").querySelector("span").textContent = String(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]) + parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]));
                card.querySelector(".my-charge").style.display = "flex";
                chargeSelect = true;
                document.querySelectorAll(".my-card").forEach(card => {
                    card.classList.remove("active");
                });
                document.body.classList.remove("overlay");
                charge = true;
                action = true;
                chargeSelect = true;
                kougekiTeishi(); 
                document.querySelector(".selected").textContent = deck[setCount]; 
                setCount ++;                                                    
                document.querySelector(".selected").classList.remove("selected");
                document.getElementById("main").style.backgroundColor = "#fff";               
            }else if(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]) +  parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]) <= parseInt(card.querySelector(".my-number").textContent.match(/\d+/)[0])){           
                card.querySelector(".my-charge").querySelector("span").textContent = String(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]) + parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]));
                card.querySelector(".my-charge").style.display = "flex";
                chargeSelect = true;
                document.querySelectorAll(".my-card").forEach(card => {
                    card.classList.remove("active");
                });
                document.body.classList.remove("overlay");
                charge = true;
                action = true;
                chargeSelect = true;
                kougekiTeishi(); 
                document.querySelector(".selected").textContent = deck[setCount]; 
                setCount ++;                                                    
                document.querySelector(".selected").classList.remove("selected");
                document.getElementById("main").style.backgroundColor = "#fff"; 
            }else{
                alert("セットカードの数を超えてしまいます");
            };
        }else if(!shieldSelect){ // シールド用カード選択後
            if(card.querySelector(".my-shield").querySelector("span").textContent === ""){
                card.querySelector(".my-shield").querySelector("span").textContent = String(parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]));
                card.querySelector(".my-shield").style.display = "flex";
                document.querySelectorAll(".my-card").forEach(card => {
                    card.classList.remove("active");
                });
                document.getElementById("main").style.backgroundColor = "#fff";
                shield = true;
                action = true; 
                shieldSelect = true;  
                boueiTeishi();
                document.querySelector(".selected").textContent = deck[setCount]; 
                setCount ++;
                document.querySelector(".selected").classList.remove("selected");                                                         
            };
        }else if(!changeSelect){ // チェンジ用カード選択後
            card.querySelector(".my-number").textContent = document.querySelector(".selected").textContent;
            document.querySelectorAll(".my-card").forEach(card => {
                card.classList.remove("active");
            });
            change = true;
            action = true;
            changeSelect = true;   
            boueiTeishi();            
            document.querySelector(".selected").textContent = deck[setCount]; 
            setCount ++;   
            document.querySelector(".selected").classList.remove("selected");
            document.getElementById("main").style.backgroundColor = "#fff";            
        }else if(!attack && attackSelect){ // アタック有効状態　かつ　アタック用カード選択前
            if((card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0] !== "0") && (card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER")){
                document.querySelectorAll(".active").forEach(card => {
                    card.classList.remove("active");
                });
                card.querySelector(".my-number").classList.add("selected");
                document.querySelectorAll(".enemy-card").forEach(card => {
                    card.classList.add("active");                    
                });
                attackSelect = false;
            };
        }else if(!attackSelect){ // アタック用カード選択後
            if((card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0] !== "0") && (card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER")){
                document.querySelector(".selected").classList.remove("selected");
                card.querySelector(".my-number").classList.add("selected");
            };            
        }else if(!tokkou && tokkouSelect){ // トッコウ有効状態　かつ　トッコウ用カード選択前
            if(card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER"){
                document.querySelectorAll(".active").forEach(card => {
                    card.classList.remove("active");
                });
                card.querySelector(".my-number").classList.add("selected");
                document.querySelectorAll(".enemy-card").forEach(card => {
                    card.classList.add("active");                    
                });
                tokkouSelect = false;
            };          
        }else if(!tokkouSelect){ // トッコウ用カード選択後
            if(card.querySelector(".my-number").textContent.replace(/\s/g, "") !== "JOKER"){
                document.querySelector(".selected").classList.remove("selected");
                card.querySelector(".my-number").classList.add("selected");
            };               
        };
    });
})


// 相手のセットカード監視
document.querySelectorAll(".enemy-card").forEach(card => {
    card.addEventListener("click", function(){ // ブロック用カード選択後
        if(!blockSelect){
            if(card.querySelector(".enemy-block").style.display === "none"){
                card.querySelector(".enemy-block").style.display = "flex";
                document.querySelectorAll(".enemy-card").forEach(card => {
                    card.classList.remove("active");
                });
                document.getElementById("main").style.backgroundColor = "#fff";
                document.querySelector(".selected").textContent = deck[setCount];
                setCount ++;
                document.querySelector(".selected").classList.remove("selected");
                block = true;
                action = true;
                blockSelect = true;
                boueiTeishi();
            };
        }else if(!attackSelect){ // アタック用カード選択後
            if(card.querySelector(".my-number").classList.contains("enemy-card-left-number")){
                if(enemyCardLeftNumber <= parseInt(document.querySelector(".selected").parentElement.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0])){

                    alert("attack succeeded");
                }else{
                    alert("attack failed");
                };
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-center-number")){
                if(enemyCardCenterNumber <= parseInt(document.querySelector(".selected").parentElement.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0])){

                    alert("attack succeeded");
                }else{
                    alert("attack failed");
                };
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-right-number")){
                if(enemyCardRightNumber <= parseInt(document.querySelector(".selected").parentElement.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0])){

                    alert("attack succeeded");
                }else{
                    alert("attack failed");
                };
            };
        }else if(!tokkouSelect){
            if(card.querySelector(".my-number").classList.contains("enemy-card-left-number")){
                if(enemyCardLeftNumber <= parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0])){

                    alert("tokkou succeeded");
                }else{
                    alert("tokkou failed");
                };
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-center-number")){
                if(enemyCardCenterNumber <= parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0])){

                    alert("tokkou succeeded");
                }else{
                    alert("tokkou failed");
                };
            }else if(card.querySelector(".my-number").classList.contains("enemy-card-right-number")){
                if(enemyCardRightNumber <= parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0])){

                    alert("tokkou succeeded");
                }else{
                    alert("tokkou failed");
                }; 
            };           
        };
    });
});

// 攻撃停止
function kougekiTeishi(){
    document.getElementById("charge").style.display = "flex";
    document.getElementById("attack").style.display = "flex";
    document.getElementById("tokkou").style.display = "flex";
    document.getElementById("charge").style.backgroundColor = "rgba(0, 0, 0, 0.5)";  
    document.getElementById("attack").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    document.getElementById("tokkou").style.backgroundColor = "rgba(0, 0, 0, 0.5)";    
    kougeki = false;
    if(!bouei){
        document.getElementById("message").textContent = "相手のターン中";
        document.getElementById("message").classList.add("enemy-turn");
        document.getElementById("message").style.display = "block";
    }
}

function boueiTeishi(){
    document.getElementById("change").style.display = "flex";
    document.getElementById("shield").style.display = "flex";
    document.getElementById("block").style.display = "flex";    
    document.getElementById("change").style.backgroundColor = "rgba(0, 0, 0, 0.5)";  
    document.getElementById("shield").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    document.getElementById("block").style.backgroundColor = "rgba(0, 0, 0, 0.5)";    
    bouei = false;
    if(!kougeki){
        document.getElementById("message").textContent = "相手のターン中";
        document.getElementById("message").classList.add("enemy-turn");
        document.getElementById("message").style.display = "block";      
    }
}

document.querySelectorAll(".enemy-hand").forEach(hand => {
    hand.style.backgroundColor = "#000"
})    
