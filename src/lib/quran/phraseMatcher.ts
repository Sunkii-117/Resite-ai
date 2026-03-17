import { tokenizeArabic } from './tokenizeArabic';
import { MatchResult, PhraseIndex } from './types';

function getNGrams(tokens: string[], sizes: number[]): string[] {
  const ngrams: string[] = [];
  for (const size of sizes) {
    for (let i = 0; i <= tokens.length - size; i += 1) {
      ngrams.push(tokens.slice(i, i + size).join(' '));
    }
  }
  return ngrams;
}

export function matchTranscriptToAyah(
  transcript: string,
  phraseIndex: PhraseIndex,
  candidateAyahIds?: string[],
): MatchResult {
  const tokens = tokenizeArabic(transcript);
  if (tokens.length < 2) {
    return { ayahId: null, confidence: 0, source: 'none' };
  }

  const ngrams = getNGrams(tokens, [3, 2]);
  const scores: Record<string, number> = {};
  let bestPhrase = '';
  let bestPhraseWeight = 0;

  for (const phrase of ngrams) {
    const ayahIds = phraseIndex[phrase] || [];
    if (!ayahIds.length) continue;

    const filtered = candidateAyahIds ? ayahIds.filter((id) => candidateAyahIds.includes(id)) : ayahIds;
    if (!filtered.length) continue;

    const phraseWeight = phrase.split(' ').length === 3 ? 0.34 : 0.22;

    for (const ayahId of filtered) {
      scores[ayahId] = (scores[ayahId] || 0) + phraseWeight;
    }

    if (phraseWeight > bestPhraseWeight) {
      bestPhraseWeight = phraseWeight;
      bestPhrase = phrase;
    }
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) {
    return { ayahId: null, confidence: 0, source: 'none' };
  }

  const [bestAyah, rawScore] = ranked[0];
  const confidence = Math.min(0.95, Number(rawScore.toFixed(2)));

  return {
    ayahId: bestAyah,
    confidence,
    source: 'global',
    phrase: bestPhrase,
  };
}
