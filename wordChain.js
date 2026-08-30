/* global playCorrect, playWrong, playFinish, speak */


let typingBox = null;

let score = 0;
let currentWord = "";
let usedWords = new Set();

let life = 2;
let wrongCount = 0;

let timer = 30;
let timerID;

let gameEnd = false;
let streak = 0;
const LEVEL_SIZE = 15;
let level = Math.floor(streak / LEVEL_SIZE);
let progress = streak % LEVEL_SIZE;

const colors = [

    "#ff4040", // đỏ

    "#ff8c00", // cam

    "#ffd400", // vàng

    "#33cc33", // xanh lá

    "#00bfff", // xanh dương

    "#4169e1", // chàm

    "#8a2be2"  // tím

];
const streakBox = document.getElementById("streakBox");
const streakFill = document.getElementById("streakFill");
const streakText = document.getElementById("streakText");

const input = document.getElementById("wordInput");
const submitBtn = document.querySelector(".submit-button");

const chatArea = document.getElementById("chatArea");
const timerBox = document.getElementById("timer");


const mistakeBox = document.getElementById("mistake");

const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultReason = document.getElementById("resultReason");
const resultScore = document.getElementById("resultScore");











input.addEventListener(
    "keydown",
    e => {
        if (e.key === "Enter") {
            submitWord();
        }
    }
);


if (submitBtn) {
    submitBtn.addEventListener(
        "click",
        submitWord
    );
}

startGame();







function startGame() {
    let startWords = Object.keys(wordChainData.lookup);
    let word =
        startWords[
        Math.floor(Math.random() * startWords.length)
        ];

    let data = wordChainData.lookup[word];
    currentWord = word;
    usedWords.add(word);
    addMessage(
        data.word,
        data.meaning,
        data.type,
        "ai"
    );
    speak(data.word);
    startTimer();
}












function submitWord() {
    if (gameEnd) return;
    let word = input.value.trim().toLowerCase();
    input.value = "";

    if (!word) return;
    let result = checkPlayerWord(word);

    if (!result.correct) {
        wrongAnswer(result.reason);
        return;
    }
    inputEffect("correct-input");
    playCorrect();
    score++;
    streak++;
    updateStreak();
    wrongCount = 0;
    updateMistake();

    let data = wordChainData.lookup[word];
    currentWord = word;
    usedWords.add(word);
    addMessage(
        data.word,
        data.meaning,
        data.type,
        "player"
    );

    speak(data.word);
    resetTimer();
    setTimeout(
        AIPlay,
        1000
    );
}












function checkPlayerWord(word) {
    let data = wordChainData.lookup[word];
    if (!data) {
        return {
            correct: false,
            reason: "Từ này không tồn tại"
        };
    }


    if (usedWords.has(word)) {
        return {
            correct: false,
            reason: "Từ này đã được dùng rồi"
        };
    }

    let lastLetter =
        currentWord[currentWord.length - 1];

    if (word[0] !== lastLetter) {
        return {
            correct: false,
            reason:
                "Cần bắt đầu bằng chữ " + lastLetter.toUpperCase()
        };
    }
    return {
        correct: true,
        data: data
    };
}












function AIPlay() {
    if (gameEnd) return;
    createTypingBox();

    setTimeout(() => {
        typingBox.remove();
        typingBox = null;
        clearInterval(typingID);

        let lastLetter =
            currentWord[currentWord.length - 1];
        let list =
            wordChainData.startsWith[lastLetter] || [];
        let available =
            list.filter(
                w => !usedWords.has(w)
            );

        if (available.length === 0) {
            endGame(
                "Bạn thắng!",
                "AI hết từ"
            );
            return;
        }

        let aiWord =
            available[
            Math.floor(
                Math.random() * available.length
            )
            ];

        let data =
            wordChainData.lookup[aiWord];
        currentWord = aiWord;
        usedWords.add(aiWord);

        addMessage(
            data.word,
            data.meaning,
            data.type,
            "ai"
        );
        speak(data.word);
        resetTimer();
    }, 1200);
}











function wrongAnswer(reason) {
    wrongCount++;
    inputEffect("wrong-input");
    playWrong();
    updateMistake();
    showNotice(
        "❌ " + reason
    );

    if (wrongCount >= 6) {
        wrongCount = 0;
        updateMistake();
        loseLife();
    }
}







function loseLife() {
    streak = 0;
    updateStreak();
    life--;
    wrongCount = 0;
    updateMistake();
    let hearts =
        document.querySelectorAll(".life");

    if (hearts[life]) {
        hearts[life].style.opacity = "0.2";
    }

    if (life <= 0) {
        endGame(
            "Bạn thua!",
            "Hết mạng"
        );
        return;
    }

    // AI đi tiếp một nước
    setTimeout(
        AIPlay,
        500
    );
}












function startTimer() {
    clearInterval(timerID);
    timer = 30;
    timerBox.innerText =
        timer + "s";

    timerID = setInterval(() => {
        timer--;
        timerBox.innerText =
            timer + "s";

        if (timer <= 0) {
            clearInterval(timerID);
            loseLife();
        }
    }, 1000);
}












function resetTimer() {
    clearInterval(timerID);
    startTimer();
}






function addMessage(word, meaning, type, side) {
    let div =
        document.createElement("div");
    div.className =
        "message " +
        (side === "player" ? "left" : "right");
    div.innerHTML = `
    ${side === "player"
            ?
            '<div class="avatar player-avatar"></div>'
            :
            ''
        }

    <div class="bubble-chat ${side === "ai" ? "ai" : ""}">
        <div class="word">
            ${word}
        <span class="type">
            ${type}
        </span>
        </div>

        <div class="meaning">
            ${meaning}
        </div>

    </div>

    ${side === "ai"
            ?
            '<div class="avatar ai-avatar"></div>'
            :
            ''
        }
    `;

    chatArea.appendChild(div);
    chatArea.scrollTop =
        chatArea.scrollHeight;

}






function showNotice(text) {
    let notice =
        document.createElement("div");
    notice.className =
        "notice";
    notice.innerText =
        text;
    document.body.appendChild(notice);

    setTimeout(() => {
        notice.remove();
    }, 1500);
}





function updateMistake() {
    mistakeBox.innerText =
        "❌ " + wrongCount + "/5";
}








function inputEffect(type) {
    input.classList.remove(
        "correct-input",
        "wrong-input"
    );


    // ép browser nhận animation lại
    void input.offsetWidth;
    input.classList.add(type);
    setTimeout(() => {
        input.classList.remove(type);
    }, 400);
}






let typingID;
function startTyping() {
    let dots = 0;
    typingID = setInterval(() => {
        dots++;

        if (dots > 3) {
            dots = 1;
        }
        typingBox.querySelector(".typing")
            .innerText =
            "typing" + ".".repeat(dots);
    }, 400);
}






function createTypingBox() {

    typingBox =
        document.createElement("div");


    typingBox.className =
        "message right";


    typingBox.innerHTML = `

    <div class="bubble-chat ai typing">
        typing...
    </div>

    <div class="avatar ai-avatar"></div>

    `;


    chatArea.appendChild(typingBox);

    startTyping();

}








function updateStreak() {



    if (streak < 3) {

        streakBox.style.display = "none";

        return;

    }

    streakBox.style.display = "block";



    let level = Math.floor(streak / LEVEL_SIZE);

    let progress = streak % LEVEL_SIZE;

    let percent = progress / LEVEL_SIZE * 100;

    if (streak >= 105) {

        streakFill.classList.add("rainbow");

        streakFill.style.width = "100%";

    }

    else {

        streakFill.classList.remove("rainbow");

        streakFill.style.background =
            colors[Math.min(level, 6)];

        streakFill.style.width =
            percent + "%";

    }

    streakText.innerText =
        getStreakTitle();

    streakBox.animate(
        [
            { transform: "scale(1.08)" },
            { transform: "scale(1)" }
        ],
        {
            duration: 180
        }
    );

}










function getStreakTitle() {

    if (streak >= 10000) return "GOD";
    if (streak >= 1000) return "IMMORTAL";
    if (streak >= 500) return "LEGEND";

    let level = Math.floor(streak / 15);

    switch (level) {

        case 0:
            return "LEVEL 1 • NICE";

        case 1:
            return "LEVEL 2 • GOOD";

        case 2:
            return "LEVEL 3 • GREAT";

        case 3:
            return "LEVEL 4 • CRAZY";

        case 4:
            return "LEVEL 5 • AMAZING";

        case 5:
            return "LEVEL 6 • INSANE";

        default:
            return "LEVEL 7 • MASTER";

    }

}












function endGame(title, reason) {
    playFinish();
    gameEnd = true;
    clearInterval(timerID);

    input.disabled = true;
    if (submitBtn) {
        submitBtn.disabled = true;
    }
    showResult(
        title,
        reason
    );
}







function showResult(title, reason) {
    saveScore();
    resultScreen.style.display = "flex";
    resultTitle.innerText =
        title;
    resultReason.innerText =
        reason;
    resultScore.innerText =
        "Score: " + score;
}






function saveScore() {
    let result = {
        score: score,
        words: usedWords.size,
        time: new Date().toLocaleString()
    };

    let rank =
        JSON.parse(
            localStorage.getItem("wordChainRank")
        ) || [];


    rank.push(result);
    rank.sort(
        (a, b) => b.score - a.score
    );

    rank = rank.slice(0, 10);

    localStorage.setItem(
        "wordChainRank",
        JSON.stringify(rank)
    );

}



function restartGame() {
    location.reload();
}