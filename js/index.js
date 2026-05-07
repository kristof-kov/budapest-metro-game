// index.js
// menu logic and rules modal handling

import { renderLeaderboard } from "./leaderboard.js";

const startButton = document.querySelector(".start-btn");
const rulesButton = document.querySelector(".rules-btn");
const lbButton = document.querySelector(".lb-btn")
const nameInput = document.querySelector("#player-name");
const modal = document.querySelector("#rules-modal");
const closeButton = document.querySelector(".close");
const lbPanel = document.querySelector("#leaderboard-panel");
const lbContent = document.querySelector("#leaderboard-content");
const lbCloseButton = document.querySelector(".lb-close-btn");

// validates the player name and proceeds to the game board
function startGame(event) {
    const name = nameInput.value.trim();

    if (name === "") {
        showError();
    }
    else {
        localStorage.setItem('playerName', name);
        window.location.href = "game.html";
    }
}

// provides brief visual feedback if the name input is empty
function showError() {
    nameInput.classList.add('error');
    nameInput.focus();
    setTimeout(() => {
        nameInput.classList.remove('error');
    }, 1000);
}

// modal visibility toggles
function openRules() {
    modal.classList.add("show");
}

function closeRules() {
    modal.classList.remove("show");
}

// leaderboard panel toggles
function openLeaderboard() {
    renderLeaderboard(lbContent);
    lbPanel.classList.remove("hidden");
}

function closeLeaderboard() {
    lbPanel.classList.add("hidden");
}


// event wiring
startButton.addEventListener('click', startGame);
rulesButton.addEventListener('click', openRules);
closeButton.addEventListener('click', closeRules);
lbButton.addEventListener("click", openLeaderboard);
lbCloseButton.addEventListener("click", closeLeaderboard);

// closes the modal when clicking the darkened backdrop
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeRules();
    }
})