// segment.js
// segment validation and SVG drawing
// all functions are stateless — they read from gameState but have no own state

import { gameState, stations, CELL_SIZE } from "./state.js";

/**
 * tries to draw a segment from a to b.
 * runs all validations and draws if they pass.
 * @returns {boolean} whether the segment was drawn
 */
export function tryDrawSegment(a, b, color, svg) {
    if (!isStraightLine(a, b)) return false;
    if (!isStationMatch(b, gameState.currentCard)) return false;
    if (isBlocked(a, b)) return false;
    if (hasSegmentBetween(a, b)) return false;
    if (wouldCreateLoop(a, b)) return false;

    drawSegment(a, b, color, svg);
    _updateLineEnds(a, b);

    if (!gameState.lineStations.some(ls => ls.x === b.x && ls.y === b.y)) {
        gameState.lineStations.push({ x: b.x, y: b.y });
    }

    gameState.firstMove = false;
    return true;
}

// only horizontal, vertical, or 45° diagonal connections are valid
export function isStraightLine(a, b) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx === 0 || dy === 0 || dx === dy;
}

// joker and Deák (type "?") match anything
export function isStationMatch(station, card) {
    if (card === "Joker") return true;
    if (station.type === "?") return true;
    return station.type === card;
}

// checks whether any station lies between a and b (segments can't pass through stations)
export function isBlocked(a, b) {
    const at = (x, y) => stations.find(s => s.x === x && s.y === y);

    if (a.x === b.x) {
        const [minY, maxY] = [Math.min(a.y, b.y), Math.max(a.y, b.y)];
        for (let y = minY + 1; y < maxY; y++) {
            if (at(a.x, y)) return true;
        }
    } else if (a.y === b.y) {
        const [minX, maxX] = [Math.min(a.x, b.x), Math.max(a.x, b.x)];
        for (let x = minX + 1; x < maxX; x++) {
            if (at(x, a.y)) return true;
        }
    } else {
        // diagonal
        const dx = Math.sign(b.x - a.x);
        const dy = Math.sign(b.y - a.y);
        let x = a.x + dx, y = a.y + dy;
        while (x !== b.x) {
            if (at(x, y)) return true;
            x += dx; y += dy;
        }
    }
    return false;
}

// prevents drawing the same segment twice
export function hasSegmentBetween(a, b) {
    return gameState.drawnSegments.some(seg =>
        (seg.x1 === a.x && seg.y1 === a.y && seg.x2 === b.x && seg.y2 === b.y) ||
        (seg.x1 === b.x && seg.y1 === b.y && seg.x2 === a.x && seg.y2 === a.y)
    );
}

// prevents the line from visiting a station it already passed through
export function wouldCreateLoop(a, b) {
    if (gameState.isSwitchCard) {
        // with a switch card any existing station can be a start point,
        // so b is only blocked if it's already in the line but not an endpoint
        const inLine = gameState.lineStations.some(ls => ls.x === b.x && ls.y === b.y);
        const isEnd = gameState.lineEnds.some(ep => ep.x === b.x && ep.y === b.y);
        return inLine && !isEnd;
    }
    return gameState.lineStations.some(ls => ls.x === b.x && ls.y === b.y);
}

export function drawSegment(a, b, color, svg) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x * CELL_SIZE + CELL_SIZE / 2);
    line.setAttribute("y1", a.y * CELL_SIZE + CELL_SIZE / 2);
    line.setAttribute("x2", b.x * CELL_SIZE + CELL_SIZE / 2);
    line.setAttribute("y2", b.y * CELL_SIZE + CELL_SIZE / 2);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", 8);
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);

    gameState.drawnSegments.push({
        x1: a.x, y1: a.y,
        x2: b.x, y2: b.y,
        line: gameState.currentLine,
    });
}

// moves the endpoint from a to b, or opens a new branch on switch card
function _updateLineEnds(a, b) {
    if (gameState.isSwitchCard || gameState.firstMove) {
        if (!gameState.lineEnds.some(ep => ep.x === b.x && ep.y === b.y)) {
            gameState.lineEnds.push({ x: b.x, y: b.y });
        }
    } else {
        gameState.lineEnds = gameState.lineEnds.filter(
            ep => !(ep.x === a.x && ep.y === a.y)
        );
        if (!gameState.lineEnds.some(ep => ep.x === b.x && ep.y === b.y)) {
            gameState.lineEnds.push({ x: b.x, y: b.y });
        }
    }
}
