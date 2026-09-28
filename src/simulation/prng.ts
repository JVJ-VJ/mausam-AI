/**
 * Mulberry32 Seeded Pseudo-Random Number Generator.
 * Provides deterministic pseudo-random sequences for repeatable telemetry datasets.
 */
export class PRNG {
  private state: number;

  constructor(seed: number = 26069) {
    this.state = seed >>> 0;
  }

  /**
   * Generates a float in [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates an integer in [min, max] inclusive
   */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generates a float in [min, max]
   */
  float(min: number, max: number, decimals: number = 2): number {
    const val = this.next() * (max - min) + min;
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  /**
   * Randomly chooses an element from an array
   */
  choice<T>(items: readonly T[] | T[]): T {
    const idx = this.int(0, items.length - 1);
    return items[idx];
  }

  /**
   * Returns a boolean with probability p
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Generates a date string within the last `hoursAgo` hours
   */
  isoDateWithinHours(hoursAgo: number, baseDate: Date = new Date()): string {
    const offsetMs = this.int(0, hoursAgo * 3600 * 1000);
    const d = new Date(baseDate.getTime() - offsetMs);
    return d.toISOString();
  }
}

export const defaultPRNG = new PRNG(26069);
