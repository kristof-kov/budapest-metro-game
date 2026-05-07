import { describe, test, expect, beforeEach } from "vitest";
import { Scorer } from "../js/Scorer.js";

// minimal station stubs, only the fields Scorer.calcRound uses
const makeStation = (x, y, district, side, train = false) =>
    ({ x, y, district, side, train });

describe("Scorer._advanceSlider", () => {
    test("starts at 0", () => {
        const s = new Scorer();
        expect(s.stationScore).toBe(0);
    });

    test("advances by the number of hits", () => {
        const s = new Scorer();
        expect(s._advanceSlider(2)).toBe(2); // 0 -> 1 -> 2
    });

    test("does not go past the end of the slider", () => {
        const s = new Scorer();
        expect(s._advanceSlider(100)).toBe(25);
    });

    test("advances from a non-zero position", () => {
        const s = new Scorer();
        s.stationScore = 4; // position 3 on the slider
        expect(s._advanceSlider(2)).toBe(8); // 4 -> 6 -> 8
    });
});

describe("Scorer.calcRound", () => {
    let scorer;
    let stations;

    beforeEach(() => {
        scorer = new Scorer();
        stations = [
            makeStation(0, 0, 1, "Buda"),
            makeStation(1, 0, 1, "Buda"),
            makeStation(2, 0, 2, "Pest"),
            makeStation(3, 0, 3, "Pest", true), // train station
        ];
    });

    test("PK counts distinct districts", () => {
        const line = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
        const { PK } = scorer.calcRound(line, stations);
        expect(PK).toBe(2); // districts 1 and 2
    });

    test("PM is the max stops in a single district", () => {
        const line = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
        const { PM } = scorer.calcRound(line, stations);
        expect(PM).toBe(2); // district 1 has 2 stops
    });

    test("PD counts Danube crossings", () => {
        // Buda -> Buda -> Pest: one crossing
        const line = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
        const { PD } = scorer.calcRound(line, stations);
        expect(PD).toBe(1);
    });

    test("FP = (PK x PM) + PD", () => {
        const line = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
        const { PK, PM, PD, FP } = scorer.calcRound(line, stations);
        expect(FP).toBe(PK * PM + PD);
    });

    test("counts train station hits", () => {
        const line = [{ x: 0, y: 0 }, { x: 3, y: 0 }];
        const { stationHits } = scorer.calcRound(line, stations);
        expect(stationHits).toBe(1);
    });

    test("no Danube crossings when all on same side", () => {
        const line = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
        const { PD } = scorer.calcRound(line, stations);
        expect(PD).toBe(0);
    });

    test("accumulates fpSum across rounds", () => {
        const line = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
        scorer.calcRound(line, stations);
        scorer.calcRound(line, stations);
        expect(scorer.fpSum).toBe(scorer.roundPoints[0].FP + scorer.roundPoints[1].FP);
    });
});

describe("Scorer.calcJunctions", () => {
    test("counts 2-line junctions", () => {
        const g = {
            M1: new Set(["1,1"]),
            M2: new Set(["1,1"]),
            M3: new Set(),
            M4: new Set(),
        };
        const { csp2 } = new Scorer().calcJunctions(g);
        expect(csp2).toBe(1);
    });

    test("counts 3-line junctions", () => {
        const g = {
            M1: new Set(["2,2"]),
            M2: new Set(["2,2"]),
            M3: new Set(["2,2"]),
            M4: new Set(),
        };
        const { csp3 } = new Scorer().calcJunctions(g);
        expect(csp3).toBe(1);
    });

    test("counts 4-line junctions", () => {
        const g = {
            M1: new Set(["3,3"]),
            M2: new Set(["3,3"]),
            M3: new Set(["3,3"]),
            M4: new Set(["3,3"]),
        };
        const { csp4 } = new Scorer().calcJunctions(g);
        expect(csp4).toBe(1);
    });

    test("cspSum = csp2*2 + csp3*5 + csp4*9", () => {
        const g = {
            M1: new Set(["1,1", "3,3"]),
            M2: new Set(["1,1", "3,3"]),
            M3: new Set(["3,3"]),
            M4: new Set(),
        };
        const { csp2, csp3, cspSum } = new Scorer().calcJunctions(g);
        expect(cspSum).toBe(csp2 * 2 + csp3 * 5);
    });

    test("no junctions returns all zeros", () => {
        const g = {
            M1: new Set(["1,1"]),
            M2: new Set(["2,2"]),
            M3: new Set(),
            M4: new Set(),
        };
        const { csp2, csp3, csp4, cspSum } = new Scorer().calcJunctions(g);
        expect(csp2).toBe(0);
        expect(csp3).toBe(0);
        expect(csp4).toBe(0);
        expect(cspSum).toBe(0);
    });
});