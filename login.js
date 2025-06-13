const supabase = window.supabase.createClient("https://ngvdppfzcgbkdtjlwbvh.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmRwcGZ6Y2dia2R0amx3YnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODU5NjMsImV4cCI6MjA2MzY2MTk2M30.6bVDy_sbtV4k_AvGeQ_aTtRhz4tBsJb2o_q8Y-OmwMA");

async function registerUser() {
    const name = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    localStorage.setItem("username", name)
    if (!name || !password) {
        alert("ユーザー名とパスワードを入力してください。");
        return;
    }

    // 同名ユーザーの有無を確認
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("name", name);

    if (error) {
        console.error("検索エラー:", error);
        alert("エラーが発生しました。");
        return;
    }

    if (data !== null) {
        alert("ログインに成功しました！");
        window.location.href = "battle.html";
        return;
    }

    if(password.length < 6){
        alert("パスワードは６桁以上にしてください");
        return
    }

    // 登録処理
    const { error: insertError } = await supabase
        .from("users")
        .insert([{ name, password }]);

    if (insertError) {
        console.error("登録エラー:", insertError);
        alert("登録に失敗しました。");
    } else {
        alert("ユーザー登録が完了しました！");
        window.location.href = "battle.html";
    }
}

function nameExistCheck(){
    Name = localStorage.getItem("username");
    if(Name !== null){
        window.location.href = "search.html";
    }
}

nameExistCheck()
