// ui.js
// all DOM reads and writes go here
// if the HTML structure changes, this is the only file that needs updating

import { gameState, lines } from "./state.js";
import { Scorer } from "./Scorer.js";

/* --- timer --- */

let _secondsElapsed = 0;
let _timerInterval  = null;

export function startTimer() {
    const el = document.querySelector("#elapsed-time");
    _timerInterval = setInterval(() => {
        _secondsElapsed++;
        const m = Math.floor(_secondsElapsed / 60);
        const s = _secondsElapsed % 60;
        el.textContent = `${m}:${s.toString().padStart(2, "0")}`;
    }, 1000);
}

export function stopTimer() {
    clearInterval(_timerInterval);
}

export function getElapsedSeconds() {
    return _secondsElapsed;
}

/* --- header displays --- */

export function renderPlayerName() {
    document.querySelector(".name-display").textContent = gameState.playerName;
}

export function renderCurrentLine() {
    const lineData = lines.find(l => l.name === gameState.currentLine);
    const icon = document.querySelector("#current-line .metro-icon");
    const name = document.querySelector("#current-line .metro-name");
    if (icon) icon.style.color  = lineData.color;
    if (name) name.textContent  = gameState.currentLine;
}

export function renderLineOrder() {
    gameState.metroOrder.forEach((metro, i) => {
        const el = document.querySelector(`.metro-${i + 1}`);
        if (el) el.textContent = metro;
    });
}

/* --- card panel --- */

export function renderCard(cardText, isSwitchCard) {
    const el = document.querySelector("#current-card");
    el.textContent = cardText;
    el.classList.toggle("switch-active", isSwitchCard);
}

export function renderDrawButtonLabel(isLastDraw) {
    document.querySelector("#draw-card-btn").textContent =
        isLastDraw ? "Forduló vége" : "Új kártya";
}

/* --- scoreboard --- */

export function renderRoundScore(round, { PK, PM, PD, FP }) {
    document.querySelector(`#pk-${round}`).textContent = PK;
    document.querySelector(`#pm-${round}`).textContent = PM;
    document.querySelector(`#pd-${round}`).textContent = PD;
    document.querySelector(`#fp-${round}`).textContent = FP;
}

export function renderTrainTrack(stationScore) {
    document.querySelectorAll(".track-cell")
        .forEach(el => el.classList.remove("active"));

    const idx = Math.max(Scorer.STATION_SLIDER.indexOf(stationScore), 0);
    document.querySelector(`#slider-${idx}`)?.classList.add("active");
}

export function renderFinalScore({ fpSum, stationScore, csp2, csp3, csp4, cspSum, total }) {
    document.querySelector("#fp-sum").textContent = fpSum;
    document.querySelector("#station-score").textContent = stationScore;
    document.querySelector("#csp2").textContent = csp2;
    document.querySelector("#csp3").textContent = csp3;
    document.querySelector("#csp4").textContent = csp4;
    document.querySelector("#csp2result").textContent = csp2 * 2;
    document.querySelector("#csp3result").textContent = csp3 * 5;
    document.querySelector("#csp4result").textContent = csp4 * 9;
    document.querySelector("#csp-sum").textContent = cspSum;
    document.querySelector("#final-score").textContent = total;
}

export function clearHighlights() {
    document.querySelectorAll(".highlight")
        .forEach(el => el.classList.remove("highlight"));
}
