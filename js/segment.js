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
    if (crossesExistingSegment(a, b)) return false;

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

// returns true if the new segment crosses any already-drawn segment
// at a point that is not a shared endpoint (station junction)
export function crossesExistingSegment(a, b) {
    for (const seg of gameState.drawnSegments) {
        const p = { x: seg.x1, y: seg.y1 };
        const q = { x: seg.x2, y: seg.y2 };
        if (_segmentsIntersect(a, b, p, q)) return true;
    }
    return false;
}

// tests whether segment a->b and segment p->q intersect at a non-endpoint point
function _segmentsIntersect(a, b, p, q) {
    // 1. bounding-box pre-filter (fast reject)
    if (Math.max(a.x, b.x) < Math.min(p.x, q.x)) return false;
    if (Math.min(a.x, b.x) > Math.max(p.x, q.x)) return false;
    if (Math.max(a.y, b.y) < Math.min(p.y, q.y)) return false;
    if (Math.min(a.y, b.y) > Math.max(p.y, q.y)) return false;

    // 2. straddling test
    // which side of line a->b are p and q on?
    const d1 = _cross(a, b, p);
    const d2 = _cross(a, b, q);
    // which side of line p->q are q and b on?
    const d3 = _cross(p, q, a);
    const d4 = _cross(p, q, b);

    if (_oppositeSides(d1, d2) && _oppositeSides(d3, d4)) {
        // proper crossing, now check if it is a shared endpoint
        if (_samePoint(a, p) || _samePoint(a, q) ||
            _samePoint(b, p) || _samePoint(b, q)) return false;
        return true;
    }

    // 3. collinear / T-intersection
    if (d1 === 0 && _onSegment(a, b, p) && !_samePoint(p, a) && !_samePoint(p, b)) return true;
    if (d2 === 0 && _onSegment(a, b, q) && !_samePoint(q, a) && !_samePoint(q, b)) return true;
    if (d3 === 0 && _onSegment(p, q, a) && !_samePoint(a, p) && !_samePoint(a, q)) return true;
    if (d4 === 0 && _onSegment(p, q, b) && !_samePoint(b, p) && !_samePoint(b, q)) return true;

    return false;
}

// 2D cross product of vectors origin->target and origin->point
// positive: point is to the left, negative: right, zero: collinear
function _cross(origin, target, point) {
    return (target.x - origin.x) * (point.y - origin.y)
         - (target.y - origin.y) * (point.x - origin.x);
}

// true if a and b are on strictly opposite sides (not on line)
function _oppositeSides(a, b) {
    return (a > 0 && b < 0) || (a < 0 && b > 0);
}

// true if point r lies on segment p->q
function _onSegment(p, q, r) {
    return Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x)
        && Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y)
}

function _samePoint(a, b) {
    return a.x === b.x && a.y === b.y;
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
