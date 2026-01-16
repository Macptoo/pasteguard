/**
 * Removes overlapping entities to prevent text corruption during masking
 *
 * When entities overlap (e.g., "Eric" and "Eric's" both detected), applying
 * both replacements corrupts the text. This function keeps only non-overlapping
 * entities, preferring longer spans when they share the same start position.
 */
export function removeOverlappingEntities<T extends { start: number; end: number }>(
  entities: T[],
): T[] {
  if (entities.length <= 1) return entities;

  // Sort by start position, then by length descending (longer = more specific)
  const sorted = [...entities].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });

  const result: T[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = result[result.length - 1];

    // Keep only if no overlap with last kept entity
    if (current.start >= last.end) {
      result.push(current);
    }
  }

  return result;
}
