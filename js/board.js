// board.js
// table generation and click handling
// actual segment logic lives in segment.js

import { gameState, stations, lines } from "./state.js";
import { tryDrawSegment } from "./segment.js";
import { clearHighlights } from "./ui.js";

let _svg = null;

export function createSVGOverlay() {
    const boardPanel = document.querySelector(".board-panel");
    _svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    _svg.style.cssText = "position:absolute;top:0;left:0;width:700px;height:700px;pointer-events:none;";
    boardPanel.style.position = "relative";
    boardPanel.appendChild(_svg);
}

export function getSVG() {
    return _svg;
}

export function generateTable() {
    const table = document.querySelector("table");

    for (let y = 0; y <= 9; y++) {
        const tr = document.createElement("tr");

        for (let x = 0; x <= 9; x++) {
            const td = document.createElement("td");
            td.dataset.x = x;
            td.dataset.y = y;

            const station = stations.find(s => s.x === x && s.y === y);
            if (station) {
                const name = station.type === "?" ? "Deak" : station.type;
                const suffix = station.train ? "_Train" : "";
                td.innerHTML = `<img src="assets/${name}${suffix}.svg" alt="${station.type}">`;
                td.classList.add("station");
                td.dataset.stationType = station.type;
            } else {
                td.innerHTML = `<img src="assets/empty.svg" alt="empty">`;
            }

            td.addEventListener("click", onCellClick);
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
}

// places the starting line marker icons on the board
export function addLineMarkers() {
    const table = document.querySelector("table");
    lines.forEach(line => {
        const start = stations.find(s => s.id === line.start);
        if (!start) return;

        const img = document.createElement("img");
        img.src = `assets/${line.name}.svg`;
        img.classList.add("line");
        img.dataset.line = line.name;
        table.rows[start.y].cells[start.x].appendChild(img);
    });
}

// two-click flow: first click selects start, second click draws the segment
export function onCellClick(e) {
    const td = e.currentTarget;
    const x = Number(td.dataset.x);
    const y = Number(td.dataset.y);
    const station = stations.find(s => s.x === x && s.y === y);

    if (!station || !gameState.currentCard) return;

    if (gameState.selectedStation === null) {
        if (!_isValidStart(station)) return;
        gameState.selectedStation = station;
        td.classList.add("highlight");
        return;
    }

    const color = lines.find(l => l.name === gameState.currentLine).color;
    const success = tryDrawSegment(gameState.selectedStation, station, color, _svg);

    clearHighlights();
    gameState.selectedStation = null;

    if (success) {
        gameState.roundMoves++;
        // notify main.js without creating a direct dependency
        document.dispatchEvent(new CustomEvent("segmentDrawn"));
    }
}

// on the first move only the line's starting station is a valid start;
// with a switch card any already-visited station can be used
function _isValidStart(station) {
    if (gameState.firstMove) {
        const lineData = lines.find(l => l.name === gameState.currentLine);
        const start = stations.find(s => s.id === lineData.start);
        return station.x === start.x && station.y === start.y;
    }
    if (gameState.isSwitchCard) {
        return gameState.lineStations.some(ls => ls.x === station.x && ls.y === station.y);
    }
    return gameState.lineEnds.some(ep => ep.x === station.x && ep.y === station.y);
}
