function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name.length > 1){
        document.getElementById("loginName").textContent = `${Name}としてログイン中`;
        document.getElementById("my-name").textContent = `${Name}`;        
    }else{
        window.location.href = "login.html";
    };
}

nameExistCheck();

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

function firstHand(){
    document.querySelectorAll(".my-hand-number").forEach(first => {
        first.textContent = deck[setCount];
        setCount ++;
    })
}

firstHand();

let enemyCardLeftNumber = 10;
let enemyCardCenterNumber = 10;
let enemyCardRightNumber = 10;
let setcard = 0;
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
            };
            setcard++;
        }

    });
});

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
    // 対戦開始！
    document.getElementById("start-message").style.display = "block";

    // 数秒後に自動で消す（任意）
    setTimeout(() => {
        document.getElementById("start-message").style.display = "none";
    }, 2000); // 2秒後に非表示
}

// チャージ構造
document.getElementById("charge").addEventListener("click", function(){
    if(charge && action && kougeki){     
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.add("active");
            charge = false;
            action = false;
        });
        document.getElementById("attack").style.display = "none";
        document.getElementById("tokkou").style.display = "none"; 
        document.body.classList.add("overlay");
    }else if(!charge && !action){                 
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.remove("active");
            charge = true; 
            action = true;      
        });
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");    
        });
        chargeSelect = true;  
        document.getElementById("attack").style.display = "flex";
        document.getElementById("tokkou").style.display = "flex";        
        document.body.classList.remove("overlay");
        document.querySelector(".selected").classList.remove("selected");
    };
})

// アタック構造
document.getElementById("attack").addEventListener("click", function(){
    if(attack && action && kougeki){
        document.querySelectorAll(".my-card").forEach(shield => {
            shield.classList.add("active");
            attack = false;
            action = false;
        });
        document.getElementById("charge").style.display = "none";
        document.getElementById("tokkou").style.display = "none"; 
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else if(!attack && !action){
        document.querySelectorAll(".my-card").forEach(shield => {
            shield.classList.remove("active");
            attack = true;
            action = true;
        }); 
        document.getElementById("charge").style.display = "flex";
        document.getElementById("tokkou").style.display = "flex";       
        document.getElementById("main").style.backgroundColor = "#fff";
    };
})

// トッコウ構造
document.getElementById("tokkou").addEventListener("click", function(){
    if(tokkou && action && kougeki){
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.add("active");
            tokkou = false;
            action = false;
        });
        document.getElementById("charge").style.display = "none";
        document.getElementById("attack").style.display = "none"; 
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else if(!tokkou && !action){
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");
            tokkou = true;
            action = true;
        }); 
        document.getElementById("charge").style.display = "flex";
        document.getElementById("attack").style.display = "flex"; 
        document.getElementById("main").style.backgroundColor = "#fff";               
    };
})

// チェンジ構造
document.getElementById("change").addEventListener("click", function(){
    if(change && action){
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.add("active");      
            change = false;
            action = false;
        });
        document.getElementById("shield").style.display = "none";
        document.getElementById("block").style.display = "none";      
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";        
    }else if(!change && !action){
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");            
            change = true;
            action = true;
        });
        document.getElementById("shield").style.display = "flex";
        document.getElementById("block").style.display = "flex";   
        document.getElementById("main").style.backgroundColor = "#fff";               
    };
})

// シールド構造
document.getElementById("shield").addEventListener("click", function(){
    if(shield && action){
        let miniNumber = false;
        document.querySelectorAll(".my-hand-number").forEach(number => {
            if(parseInt(number.textContent.match(/\d+/)[0]) === 1 || parseInt(number.textContent.match(/\d+/)[0]) === 2 || parseInt(number.textContent.match(/\d+/)[0]) === 3){
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
            document.body.classList.add("overlay");
            shield = false;
            action = false;
        });
        document.getElementById("change").style.display = "none";
        document.getElementById("block").style.display = "none";   
    }else if(!shield && !action){
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.remove("active");
            hand.classList.remove("miniNumber");
            shield = true;
            action = true;
        }); 
        document.body.classList.remove("overlay");
        document.getElementById("change").style.display = "flex";
        document.getElementById("block").style.display = "flex";          
    };
})

// ブロック構造
document.getElementById("block").addEventListener("click", function(){
    if(block && action){
        let miniNumber = false;
        document.querySelectorAll(".my-hand-number").forEach(number => {
            if(parseInt(number.textContent.match(/\d+/)[0]) === 1 || parseInt(number.textContent.match(/\d+/)[0]) === 2 || parseInt(number.textContent.match(/\d+/)[0]) === 3){
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
            block = false;
            action = false;
        });
        document.getElementById("change").style.display = "none";
        document.getElementById("shield").style.display = "none"; 
        document.body.classList.add("overlay");
    }else if(!block && !action){
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.remove("active");
            hand.classList.remove("miniNumber");
            block = true;
            action = true;
        }); 
        document.getElementById("change").style.display = "flex";
        document.getElementById("shield").style.display = "flex";         
        document.body.classList.remove("overlay");       
    };
})

chargeSelect = true;

document.querySelectorAll(".my-hand").forEach(hand => {
    hand.addEventListener("click", function(){
        if(!charge && chargeSelect){
            hand.querySelector("p").classList.add("selected");
            document.querySelectorAll(".my-hand").forEach(hand => {
                hand.classList.remove("active");    
            });
            document.querySelectorAll(".my-card").forEach(card => {
                card.classList.add("active");    
            });
            chargeSelect = false;              
        }else if(!chargeSelect && document.querySelector(".selected")){
            document.querySelector(".selected").classList.remove("selected");
            hand.classList.add("selected");
        }else if(hand.classList.contains("miniNumber")){
            hand.querySelector("p").classList.add("selected");
            document.querySelectorAll(".my-hand").forEach(hand => {
                hand.classList.remove("active");    
            });
            document.querySelectorAll(".my-card").forEach(card => {
                card.classList.add("active");    
            });                                  
        };
    });
})

document.querySelectorAll(".my-card").forEach(card => {
    card.addEventListener("click", function(){
        if(!chargeSelect){
            if(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]) +  parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]) <= parseInt(card.querySelector(".my-number").textContent.match(/\d+/)[0])){           
                card.querySelector(".my-charge").querySelector("span").textContent = String(parseInt(card.querySelector(".my-charge").querySelector("span").textContent.match(/\d+/)[0]) + parseInt(document.querySelector(".selected").textContent.match(/\d+/)[0]));
                card.querySelector(".my-charge").style.display = "flex";
                chargeSelect = true;
                document.querySelectorAll(".my-card").forEach(card => {
                    card.classList.remove("active");
                });
                document.body.classList.remove("overlay");
                charge = true;
                action = true;
                document.getElementById("attack").style.display = "flex";
                document.getElementById("tokkou").style.display = "flex";
                kougekiTeishi(); 
                document.querySelector(".selected").textContent = deck[setCount]; 
                setCount ++;                                                    
                document.querySelector(".selected").classList.remove("selected");
            }else{
                alert("セットカードの数を超えてしまいます");
            }
        };
    });
})

function kougekiTeishi(){
                document.getElementById("charge").style.backgroundColor = "rgba(0, 0, 0, 0.5)";  
                document.getElementById("attack").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                document.getElementById("tokkou").style.backgroundColor = "rgba(0, 0, 0, 0.5)";    
                kougeki = false;
}

