/**
 * Lightweight NLP Tokenization and Semantic Text Similarity Module.
 * Computes Jaccard, Dice, stemming, domain synonym canonicalization,
 * and N-Gram token overlap without requiring external neural models.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when',
  'where', 'who', 'which', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'can', 'just', 'should', 'now', 'reported',
  'reporting', 'due', 'across', 'along', 'near', 'around', 'area', 'past', 'hours',
  'being', 'after', 'into', 'over'
]);

/**
 * Weather & disaster domain synonym normalization dictionary.
 * Helps recognize identical incident semantics across diverse reporting vernacular.
 */
const DOMAIN_SYNONYMS: Record<string, string> = {
  dyke: 'embankment',
  bund: 'embankment',
  collaps: 'breach',
  collapsed: 'breach',
  highway: 'road',
  street: 'road',
  lane: 'road',
  expressway: 'road',
  downpour: 'cloudburst',
  deluge: 'cloudburst',
  torrential: 'cloudburst',
  inundat: 'flood',
  inundated: 'flood',
  inundation: 'flood',
  waterlog: 'flood',
  waterlogged: 'flood',
  waterlogging: 'flood',
  gale: 'wind',
  squall: 'wind',
  tributary: 'river',
  stream: 'river',
  creek: 'river',
};

/**
 * Basic algorithmic stemmer for English weather and disaster narratives.
 */
export function stemWord(word: string): string {
  let w = word.toLowerCase();
  if (w.length <= 3) return w;

  // Common inflections in weather descriptions
  if (w.endsWith('ing') && w.length > 5) {
    w = w.slice(0, -3);
  } else if (w.endsWith('ed') && w.length > 4) {
    w = w.slice(0, -2);
  } else if (w.endsWith('es') && w.length > 4) {
    w = w.slice(0, -2);
  } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
    w = w.slice(0, -1);
  }

  // Handle double consonants at end after stripping (e.g. floodd -> flood)
  if (w.length > 3 && w[w.length - 1] === w[w.length - 2]) {
    w = w.slice(0, -1);
  }

  // Domain synonym lookup
  return DOMAIN_SYNONYMS[w] || w;
}

/**
 * Normalizes and tokenizes a string into clean meaningful keywords with stemming and synonyms.
 */
export function tokenizeText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Strip punctuation/symbols except alphanumeric
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return [];

  return clean
    .split(' ')
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .map(stemWord);
}

/**
 * Computes character bigrams for sub-token fuzzy comparison.
 */
export function getBigrams(str: string): Set<string> {
  const s = str.toLowerCase().replace(/[^\w]/g, '');
  const bigrams = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Computes text similarity score between 0 and 100 based on word token and bigram overlap.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;

  // Clean raw normalization comparison
  const cleanA = textA.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanB = textB.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanA === cleanB) return 100;

  const tokensA = new Set(tokenizeText(textA));
  const tokensB = new Set(tokenizeText(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  // 1. Word Token Intersection
  let intersectionCount = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersectionCount += 1;
    }
  });

  // Dice coefficient on tokens: (2 * |A ∩ B|) / (|A| + |B|)
  const tokenDice = (2 * intersectionCount) / (tokensA.size + tokensB.size);

  // Containment score: |A ∩ B| / min(|A|, |B|)
  const containment = intersectionCount / Math.min(tokensA.size, tokensB.size);

  // 2. Character Bigram Similarity for phrasing nuances
  const bigramsA = getBigrams(textA);
  const bigramsB = getBigrams(textB);

  let bigramIntersection = 0;
  bigramsA.forEach((bg) => {
    if (bigramsB.has(bg)) {
      bigramIntersection += 1;
    }
  });

  const bigramUnion = new Set([...bigramsA, ...bigramsB]).size;
  const bigramSim = bigramUnion > 0 ? bigramIntersection / bigramUnion : 0;

  // Blend: 50% Token Dice + 25% Token Containment + 25% Bigram Sim
  const composite = 0.50 * tokenDice + 0.25 * containment + 0.25 * bigramSim;

  return Math.min(100, Math.max(0, Math.round(composite * 100)));
}
