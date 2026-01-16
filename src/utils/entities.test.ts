import { describe, expect, test } from "bun:test";
import { removeOverlappingEntities } from "./entities";

describe("removeOverlappingEntities", () => {
  test("returns empty array for empty input", () => {
    expect(removeOverlappingEntities([])).toEqual([]);
  });

  test("returns single entity unchanged", () => {
    const entities = [{ start: 0, end: 5 }];
    expect(removeOverlappingEntities(entities)).toEqual(entities);
  });

  test("keeps non-overlapping entities", () => {
    const entities = [
      { start: 0, end: 5 },
      { start: 10, end: 15 },
    ];
    expect(removeOverlappingEntities(entities)).toEqual(entities);
  });

  test("keeps adjacent entities (not overlapping)", () => {
    const entities = [
      { start: 0, end: 4 },
      { start: 4, end: 9 },
    ];
    expect(removeOverlappingEntities(entities)).toEqual(entities);
  });

  test("removes overlapping entity with same start - keeps longer", () => {
    // "Eric" vs "Eric's" - both start at 6
    const entities = [
      { start: 6, end: 10 }, // "Eric"
      { start: 6, end: 12 }, // "Eric's"
    ];
    const result = removeOverlappingEntities(entities);
    expect(result).toHaveLength(1);
    expect(result[0].end).toBe(12); // longer one kept
  });

  test("removes partially overlapping entity", () => {
    const entities = [
      { start: 0, end: 10 },
      { start: 5, end: 15 },
    ];
    const result = removeOverlappingEntities(entities);
    expect(result).toHaveLength(1);
    expect(result[0].start).toBe(0);
  });

  test("removes nested entity", () => {
    const entities = [
      { start: 0, end: 14 }, // "Dr. John Smith"
      { start: 4, end: 8 }, // "John"
    ];
    const result = removeOverlappingEntities(entities);
    expect(result).toHaveLength(1);
    expect(result[0].end).toBe(14); // outer kept
  });

  test("handles multiple overlap groups", () => {
    const entities = [
      { start: 0, end: 5 },
      { start: 2, end: 7 }, // overlaps with first
      { start: 20, end: 25 },
      { start: 22, end: 28 }, // overlaps with third
    ];
    const result = removeOverlappingEntities(entities);
    expect(result).toHaveLength(2);
    expect(result[0].start).toBe(0);
    expect(result[1].start).toBe(20);
  });

  test("preserves additional entity properties", () => {
    const entities = [
      { start: 0, end: 5, entity_type: "PERSON", score: 0.9 },
      { start: 2, end: 7, entity_type: "PERSON", score: 0.8 },
    ];
    const result = removeOverlappingEntities(entities);
    expect(result).toHaveLength(1);
    expect(result[0].entity_type).toBe("PERSON");
    expect(result[0].score).toBe(0.9);
  });
});
