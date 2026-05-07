// main.js
// entry point — wires up modules and drives the round/game flow

import { gameState, stations, lines } from "./state.js";
import { Deck }   from "./Deck.js";
import { Scorer } from "./Scorer.js";
import { createSVGOverlay, generateTable, addLineMarkers } from "./board.js";
import {
    startTimer, stopTimer,
    renderPlayerName, renderCurrentLine, renderLineOrder,
    renderCard, renderDrawButtonLabel,
    renderRoundScore, renderTrainTrack, renderFinalScore,
    getElapsedSeconds, renderGameOverModal
} from "./ui.js";
import { saveResult } from "./leaderboard.js";

const deck = new Deck();
const scorer = new Scorer();

/* --- init --- */

function initGame() {
    gameState.metroOrder = ["M1", "M2", "M3", "M4"];
    _shuffle(gameState.metroOrder);

    createSVGOverlay();
    generateTable();
    addLineMarkers();
    renderPlayerName();
    startTimer();

    // board.js fires this event after a successful segment draw
    document.addEventListener("segmentDrawn", onSegmentDrawn);
    document.querySelector("#draw-card-btn").addEventListener("click", onDrawButtonClick);

    startRound();
}

/* --- round flow --- */

function startRound() {
    gameState.currentLine = gameState.metroOrder[gameState.currentMetroIndex];
    gameState.firstMove = true;
    gameState.selectedStation = null;
    gameState.roundMoves = 0;
    gameState.isSwitchCard = false;

    const lineData = lines.find(l => l.name === gameState.currentLine);
    const startSt = stations.find(s => s.id === lineData.start);
    gameState.lineEnds = [{ x: startSt.x, y: startSt.y }];
    gameState.lineStations = [{ x: startSt.x, y: startSt.y }];

    deck.reset();
    renderCurrentLine();
    renderLineOrder();
    renderDrawButtonLabel(false);
    _drawCard();

    console.log("round started:", gameState.currentLine);
}

function endRound() {
    const points = scorer.calcRound(gameState.lineStations, stations);

    // save visited stations for junction calculation later
    gameState.lineStations.forEach(pos => {
        gameState.globalLineStations[gameState.currentLine].add(`${pos.x},${pos.y}`);
    });

    renderRoundScore(gameState.currentRound, points);
    renderTrainTrack(scorer.stationScore);

    console.log("round ended:", points);

    gameState.currentMetroIndex++;
    gameState.currentRound++;

    if (gameState.currentMetroIndex < gameState.metroOrder.length) {
        startRound();
    } else {
        endGame();
    }
}

function endGame() {
    stopTimer();
    const final = scorer.calcFinal(gameState.globalLineStations);
    renderFinalScore(final);

    saveResult({
        name: gameState.playerName,
        total: final.total,
        seconds: getElapsedSeconds()
    });

    gameState.gameOver = true;
    renderGameOverModal(final.total, getElapsedSeconds())
    console.log("game over:", final);
}

/* --- event handlers --- */

function onSegmentDrawn() {
    if (deck.isRoundEnding) endRound();
    else _drawCard();
}

function onDrawButtonClick() {
    if (gameState.lastDraw || deck.isEmpty) endRound();
    else _drawCard();
}

/* --- helpers --- */

function _drawCard() {
    const result = deck.draw();
    if (!result) { endRound(); return; }

    gameState.currentCard = result.card;
    gameState.currentCardType = result.platform;
    gameState.isSwitchCard = result.isSwitchCard;
    gameState.lastDraw = deck.isRoundEnding;

    const label = result.isSwitchCard
        ? `Váltó (középső)\n${result.card} (${Deck.PLATFORM_LABEL[result.platform]})`
        : `${result.card} (${Deck.PLATFORM_LABEL[result.platform]})`;

    renderCard(label, result.isSwitchCard);
    renderDrawButtonLabel(gameState.lastDraw);
}

function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

/* --- start --- */

initGame();
