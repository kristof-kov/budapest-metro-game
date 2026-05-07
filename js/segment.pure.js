// segment.pure.js
// segment.js pure functions only, extracted for testing

export function isStraightLine(a, b) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx === 0 || dy === 0 || dx === dy;
}

export function isStationMatch(station, card) {
    if (card === "Joker") return true;
    if (station.type === "?") return true;
    return station.type === card;
}

export function isBlocked(a, b, stations) {
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

export function hasSegmentBetween(a, b, drawnSegments) {
    return drawnSegments.some(seg =>
        (seg.x1 === a.x && seg.y1 === a.y && seg.x2 === b.x && seg.y2 === b.y) ||
        (seg.x1 === b.x && seg.y1 === b.y && seg.x2 === a.x && seg.y2 === a.y)
    );
}