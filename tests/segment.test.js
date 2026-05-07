import { describe, test, expect } from "vitest";
import { isStraightLine, isStationMatch, isBlocked, hasSegmentBetween } from "../js/segment.pure.js";

describe("isStraightLine", () => {
    test("horizontal line", () => {
        expect(isStraightLine({ x: 0, y: 0 }, { x: 4, y: 0 })).toBe(true);
    });

    test("vertical line", () => {
        expect(isStraightLine({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(true);
    });

    test("45 degree diagonal", () => {
        expect(isStraightLine({ x: 0, y: 0 }, { x: 3, y: 3 })).toBe(true);
    });

    test("non-straight line", () => {
        expect(isStraightLine({ x: 0, y: 0 }, { x: 2, y: 3 })).toBe(false);
    });

    test("same point", () => {
        expect(isStraightLine({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe(true);
    });
});

describe("isStationMatch", () => {
    test("matching letter", () => {
        expect(isStationMatch({ type: "A" }, "A")).toBe(true);
    });

    test("non-matching letter", () => {
        expect(isStationMatch({ type: "A" }, "B")).toBe(false);
    });

    test("Joker card matches any station", () => {
        expect(isStationMatch({ type: "A" }, "Joker")).toBe(true);
        expect(isStationMatch({ type: "D" }, "Joker")).toBe(true);
    });

    test("Deák tér (?) matches any card", () => {
        expect(isStationMatch({ type: "?" }, "A")).toBe(true);
        expect(isStationMatch({ type: "?" }, "D")).toBe(true);
    });

    test("Joker card on Deák tér", () => {
        expect(isStationMatch({ type: "?" }, "Joker")).toBe(true);
    });
});

describe("isBlocked", () => {
    const stations = [
        { x: 0, y: 0 },
        { x: 2, y: 0 }, // middle of a potential horizontal segment
        { x: 4, y: 0 },
        { x: 0, y: 2 }, // middle of a potential vertical segment
        { x: 0, y: 4 },
        { x: 2, y: 2 }, // middle of a potential diagonal segment
        { x: 4, y: 4 },
    ];

    test("horizontal: blocked by station in between", () => {
        expect(isBlocked({ x: 0, y: 0 }, { x: 4, y: 0 }, stations)).toBe(true);
    });

    test("horizontal: not blocked when adjacent", () => {
        expect(isBlocked({ x: 0, y: 0 }, { x: 2, y: 0 }, stations)).toBe(false);
    });

    test("vertical: blocked by station in between", () => {
        expect(isBlocked({ x: 0, y: 0 }, { x: 0, y: 4 }, stations)).toBe(true);
    });

    test("vertical: not blocked when adjacent", () => {
        expect(isBlocked({ x: 0, y: 0 }, { x: 0, y: 2 }, stations)).toBe(false);
    });

    test("diagonal: blocked by station in between", () => {
        expect(isBlocked({ x: 0, y: 0 }, { x: 4, y: 4 }, stations)).toBe(true);
    });

    test("diagonal: not blocked when adjacent", () => {
        expect(isBlocked({ x: 0, y: 0 }, { x: 2, y: 2 }, stations)).toBe(false);
    });
});

describe("hasSegmentBetween", () => {
    const segments = [
        { x1: 0, y1: 0, x2: 1, y2: 0 },
    ];

    test("detects existing segment in same direction", () => {
        expect(hasSegmentBetween({ x: 0, y: 0 }, { x: 1, y: 0 }, segments)).toBe(true);
    });

    test("detects existing segment in reverse direction", () => {
        expect(hasSegmentBetween({ x: 1, y: 0 }, { x: 0, y: 0 }, segments)).toBe(true);
    });

    test("returns false when no segment exists", () => {
        expect(hasSegmentBetween({ x: 0, y: 0 }, { x: 0, y: 1 }, segments)).toBe(false);
    });

    test("returns false with empty segment list", () => {
        expect(hasSegmentBetween({ x: 0, y: 0 }, { x: 1, y: 0 }, [])).toBe(false);
    });
});