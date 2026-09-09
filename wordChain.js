/* global playCorrect, playWrong, playFinish, speak */

let totalWrong = 0;
let typingBox = null;

let typingID;
let score = 0;
let currentWord = "";
let usedWords = new Set();

let life = 2;
let wrongCount = 0;
let rankStreak = "none";
let timer = 30;
let timerID;

let gameEnd = false;
let streak = 0;
const LEVEL_SIZE = 15;
let level = Math.floor(streak / LEVEL_SIZE);
let progress = streak % LEVEL_SIZE;

let maxStreak = 0;
let startTime = Date.now();

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
        null,
        data.type,
        "ai",
        data.meanings
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
    if (streak > maxStreak) {
        maxStreak = streak;
    }
    updateStreak();
    wrongCount = 0;
    updateMistake();

    let data = wordChainData.lookup[word];
    currentWord = word;
    usedWords.add(word);
    addMessage(
        data.word,
        null,
        data.type,
        "player",
        data.meanings
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
            null,
            data.type,
            "ai",
            data.meanings
        );
        speak(data.word);
        resetTimer();
    }, 1200);
}











function wrongAnswer(reason) {
    wrongCount++;
    totalWrong++;
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








function addMessage(word, meaning, type, side, meanings = []) {

    let div = document.createElement("div");

    div.className =
        "message " +
        (side === "player" ? "left" : "right");


    // =====================================================
    // TYPE
    // =====================================================

    let typeText = Array.isArray(type)
        ? type.join(", ")
        : type;


    // =====================================================
    // MEANINGS
    // =====================================================


    let allMeanings = Array.isArray(meanings)
        ? meanings
        : [];


    // -----------------------------------------------------
    // Nếu chưa có meanings thì dùng meaning cũ
    // -----------------------------------------------------

    if (allMeanings.length === 0 && meaning) {

        allMeanings = [
            {
                type: typeText,
                text: meaning,
                examples: []
            }
        ];
    }


    // =====================================================
    // NGHĨA ĐẦU TIÊN
    // =====================================================

    let firstMeaning =
        allMeanings.length > 0
            ? allMeanings[0].text
            : "";


    // =====================================================
    // TẠO DANH SÁCH NGHĨA
    // =====================================================

    let meaningsHTML = allMeanings
        .map(item => {

            return `
                <div class="meaning-item">
                    <span class="meaning-bullet">•</span>
                    <span class="meaning-text">
                        ${item.text}
                    </span>
                </div>
            `;

        })
        .join("");


    // =====================================================
    // HTML
    // =====================================================

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
                    ${typeText}
                </span>

            </div>


            <!-- Nghĩa đầu tiên -->
            <div class="meaning-preview">
                ${firstMeaning}
            </div>


            <!-- Nút V -->
            ${allMeanings.length > 1
            ?
            `
                        <button
                            class="meaning-toggle"
                            type="button"
                        >
                            [V] ▼
                        </button>
                    `
            :
            ''
        }


            <!-- Toàn bộ nghĩa -->
            ${allMeanings.length > 1
            ?
            `
                        <div class="meaning-list">

                            ${meaningsHTML}

                        </div>
                    `
            :
            ''
        }

        </div>


        ${side === "ai"
            ?
            '<div class="avatar ai-avatar"></div>'
            :
            ''
        }
    `;


    // =====================================================
    // ADD TO CHAT
    // =====================================================

    chatArea.appendChild(div);

    chatArea.scrollTop =
        chatArea.scrollHeight;


    // =====================================================
    // TOGGLE [V]
    // =====================================================

    let toggleBtn =
        div.querySelector(".meaning-toggle");

    let meaningList =
        div.querySelector(".meaning-list");

    let meaningPreview =
        div.querySelector(".meaning-preview");


    if (toggleBtn && meaningList) {

        toggleBtn.addEventListener("click", () => {

            let isOpen =
                meaningList.classList.contains("show");


            if (isOpen) {

                // Đóng
                meaningList.classList.remove("show");

                meaningPreview.style.display = "block";

                toggleBtn.innerText = "[V] ▼";

            }
            else {

                // Mở
                meaningList.classList.add("show");

                meaningPreview.style.display = "none";

                toggleBtn.innerText = "[V] ▲";

            }


            // Giữ vị trí chat hợp lý
            chatArea.scrollTop =
                chatArea.scrollHeight;

        });

    }

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

    if (streak >= 10000) {
        rankStreak = "GOD";
        return "GOD";
    }

    if (streak >= 1000) {
        rankStreak = "IMMORTAL";
        return "IMMORTAL";
    }

    if (streak >= 500) {
        rankStreak = "LEGEND";
        return "LEGEND";
    }

    let level = Math.floor(streak / 15);

    switch (level) {

        case 0:
            rankStreak = "NICE";
            return "LEVEL 1 • NICE";

        case 1:
            rankStreak = "GOOD";
            return "LEVEL 2 • GOOD";

        case 2:
            rankStreak = "GREAT";
            return "LEVEL 3 • GREAT";

        case 3:
            rankStreak = "CRAZY";
            return "LEVEL 4 • CRAZY";

        case 4:
            rankStreak = "AMAZING";
            return "LEVEL 5 • AMAZING";

        case 5:
            rankStreak = "INSANE";
            return "LEVEL 6 • INSANE";

        default:
            rankStreak = "MASTER";
            return "LEVEL 7 • MASTER";

    }

}




















function showResult(title, reason) {
    let accuracy = 100;
    if (score + totalWrong > 0) {
        accuracy =
            Math.round(
                score / (score + totalWrong) * 100
            );
    }

    let seconds = Math.floor((Date.now() - startTime) / 1000);
    let minute = Math.floor(seconds / 60);
    let second = String(seconds % 60).padStart(2, "0");

    resultScreen.style.display = "flex";
    resultTitle.innerText = title;
    resultReason.innerText = reason;
    resultScore.innerHTML =
        resultScore.innerHTML =
        `
🏆 Score : ${score}<br><br>

🔥 Max Streak : ${maxStreak}<br>

🎯 Accuracy : ${accuracy}%<br>

🧠 Words : ${usedWords.size}<br>

❤️ Lives Left : ${life}<br>

⏱ Time : ${minute}:${second}<br><br>

⭐ ${rankStreak}
`;
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





