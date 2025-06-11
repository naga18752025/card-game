function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name.length > 1){
        document.getElementById("loginName").textContent = `${Name}としてログイン中`;
        document.getElementById("my-name").textContent = `${Name}`;        
    }else{
        window.location.href = "login.html";
    }
}

nameExistCheck()

let enemyCardLeftNumber = 10;
let enemyCardCenterNumber = 10;
let enemyCardRightNumber = 10;
let setcard = 0;
let action = 0;
let charge = true;
let attack = true;
let tokkou = true;
let change = true;
let shield = true;
let block = true;

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
    // 表示する
    document.getElementById("start-message").style.display = "block";

    // 数秒後に自動で消す（任意）
    setTimeout(() => {
        document.getElementById("start-message").style.display = "none";
    }, 2000); // 2秒後に非表示
}


document.getElementById("charge").addEventListener("click", function(){
    if(charge){     
        document.getElementById("attack").classList.add("kougekikei-active");
        document.getElementById("tokkou").classList.add("kougekikei-active");    
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.add("active");
            charge = !charge;
        });
        document.body.classList.add("overlay");
    }else{       
        document.getElementById("attack").classList.remove("kougekikei-active");
        document.getElementById("tokkou").classList.remove("kougekikei-active");           
        document.querySelectorAll(".my-hand").forEach(hand => {
            hand.classList.remove("active");
            charge = !charge;       
        });
        document.body.classList.remove("overlay");
    };
})

document.getElementById("attack").addEventListener("click", function(){
    if(attack){
        document.querySelectorAll(".my-charge").forEach(shield => {
            shield.classList.add("active");
            attack = !attack;
        });
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else{
        document.querySelectorAll(".my-charge").forEach(shield => {
            shield.classList.remove("active");
            attack = !attack;
        });
        document.getElementById("main").style.backgroundColor = "#fff";
    };
})

document.getElementById("tokkou").addEventListener("click", function(){
    if(tokkou){
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.add("active");
            tokkou = !tokkou;
        });
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }else{
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");
            tokkou = !tokkou;
        }); 
        document.getElementById("main").style.backgroundColor = "#fff";               
    };
})

document.getElementById("change").addEventListener("click", function(){
    if(change){
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.add("active");
            change = !change;
        });
        document.getElementById("main").style.backgroundColor = "rgba(0, 0, 0, 0.5)";        
    }else{
        document.querySelectorAll(".my-card").forEach(card => {
            card.classList.remove("active");
            change = !change
        }); 
        document.getElementById("main").style.backgroundColor = "#fff";               
    };
})

document.getElementById("shield").addEventListener("click", function(){
    if(shield){
        let miniNumber = false;
        document.querySelectorAll(".my-hand-number").forEach(number => {
            if(number.textContent === "1" || number.textContent === "2" || number.textContent === "3"){
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
        });
    }else{
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.remove("active");
            document.body.classList.remove("overlay");
            shield = true;
        });        
    };
})

document.getElementById("block").addEventListener("click", function(){
    if(block){
        let miniNumber = false;
        document.querySelectorAll(".my-hand-number").forEach(number => {
            if(number.textContent === "1" || number.textContent === "2" || number.textContent === "3"){
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
        });
        document.body.classList.add("overlay");
    }else{
        document.querySelectorAll(".miniNumber").forEach(hand => {
            hand.classList.remove("active");
            block = true;
        }); 
        document.body.classList.remove("overlay");       
    };
})

