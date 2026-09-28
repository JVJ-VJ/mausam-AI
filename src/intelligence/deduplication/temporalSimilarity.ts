/**
 * Temporal Proximity Scoring Module.
 */

/**
 * Calculates absolute difference between two ISO timestamps in minutes.
 */
export function calculateTimeDifferenceMinutes(timeA: string, timeB: string): number {
  if (!timeA || !timeB) return 99999;
  const dateA = new Date(timeA).getTime();
  const dateB = new Date(timeB).getTime();

  if (isNaN(dateA) || isNaN(dateB)) return 99999;

  return Math.abs(Math.round((dateA - dateB) / 60000));
}

/**
 * Converts temporal difference in minutes into a 0 - 100 similarity score.
 * < 15 min  -> 95 - 100%
 * < 60 min  -> 85 - 94%
 * < 180 min -> 65 - 84%
 * < 720 min -> 30 - 64%
 * > 720 min -> decays towards 0%
 */
export function calculateTemporalSimilarity(
  timeA: string,
  timeB: string
): { similarity: number; diffMinutes: number } {
  const diffMinutes = calculateTimeDifferenceMinutes(timeA, timeB);

  if (diffMinutes <= 15) {
    const sim = 100 - (diffMinutes / 15) * 5;
    return { similarity: Math.round(sim), diffMinutes };
  } else if (diffMinutes <= 60) {
    const sim = 94 - ((diffMinutes - 15) / 45) * 10;
    return { similarity: Math.round(sim), diffMinutes };
  } else if (diffMinutes <= 180) {
    const sim = 84 - ((diffMinutes - 60) / 120) * 20;
    return { similarity: Math.round(sim), diffMinutes };
  } else if (diffMinutes <= 720) {
    const sim = 64 - ((diffMinutes - 180) / 540) * 34;
    return { similarity: Math.round(sim), diffMinutes };
  } else {
    const sim = Math.max(0, 30 - ((diffMinutes - 720) / 1440) * 30);
    return { similarity: Math.round(sim), diffMinutes };
  }
}
