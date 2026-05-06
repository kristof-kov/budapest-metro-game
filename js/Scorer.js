// Scorer.js
// handles all scoring: per-round points and final totals

export class Scorer {
    static STATION_SLIDER = [0, 1, 2, 4, 6, 8, 11, 14, 17, 21, 25];

    constructor() {
        this.fpSum = 0;  // cumulative round points
        this.stationScore = 0;  // current position on the train station slider
        this.roundPoints  = [];
    }

    /**
     * calculates PK/PM/PD/FP for one round and advances the station slider.
     * @param {Array<{x,y}>} lineStations - stations visited this round
     * @param {Array<object>} stations    - full station list
     * @returns {{ PK, PM, PD, FP, stationHits }}
     */
    calcRound(lineStations, stations) {
        const visited = lineStations.map(pos =>
            stations.find(s => s.x === pos.x && s.y === pos.y)
        );

        const districtCounts = {};
        let stationHits = 0;

        for (const s of visited) {
            districtCounts[s.district] = (districtCounts[s.district] ?? 0) + 1;
            if (s.train) stationHits++;
        }

        const PK = Object.keys(districtCounts).length;
        const PM = Math.max(...Object.values(districtCounts));

        // count river crossings between consecutive stations
        // note: only accurate if lineStations is in visit order
        let PD = 0;
        for (let i = 0; i < visited.length - 1; i++) {
            if (visited[i].side !== visited[i + 1].side) PD++;
        }

        const FP = (PK * PM) + PD;
        this.fpSum += FP;
        this.stationScore = this._advanceSlider(stationHits);

        const result = { PK, PM, PD, FP, stationHits };
        this.roundPoints.push(result);
        return result;
    }

    /**
     * counts junction stations (visited by 2, 3, or 4 lines).
     * @param {{ M1: Set, M2: Set, M3: Set, M4: Set }} globalLineStations
     * @returns {{ csp2, csp3, csp4, cspSum }}
     */
    calcJunctions(globalLineStations) {
        const stationMap = {};
        for (const line in globalLineStations) {
            globalLineStations[line].forEach(key => {
                stationMap[key] = (stationMap[key] ?? 0) + 1;
            });
        }

        let csp2 = 0, csp3 = 0, csp4 = 0;
        for (const count of Object.values(stationMap)) {
            if (count === 2) csp2++;
            if (count === 3) csp3++;
            if (count === 4) csp4++;
        }

        return { csp2, csp3, csp4, cspSum: csp2 * 2 + csp3 * 5 + csp4 * 9 };
    }

    // final score = sum of round points + station slider + junction points
    calcFinal(globalLineStations) {
        const junctions = this.calcJunctions(globalLineStations);
        return {
            ...junctions,
            fpSum: this.fpSum,
            stationScore: this.stationScore,
            total: this.fpSum + this.stationScore + junctions.cspSum,
        };
    }

    _advanceSlider(hits) {
        const slider = Scorer.STATION_SLIDER;
        const idx = slider.indexOf(this.stationScore);
        const safe = idx === -1 ? 0 : idx;
        return slider[Math.min(safe + hits, slider.length - 1)];
    }
}
