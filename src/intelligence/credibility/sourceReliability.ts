import type { ReportSource } from '../../types';
import { INTELLIGENCE_CONFIG } from '../config';

/**
 * Returns baseline source reliability score for a given reporting channel.
 * Prototype assumption for SIH26069, configurable in INTELLIGENCE_CONFIG.
 */
export function getSourceReliability(source: ReportSource): number {
  return INTELLIGENCE_CONFIG.sourceReliability[source] || 50;
}
