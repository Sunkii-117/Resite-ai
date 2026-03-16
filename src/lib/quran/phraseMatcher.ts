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
  let best: MatchResult = { ayahId: null, confidence: 0, source: 'none' };

  for (const phrase of ngrams) {
    const ayahIds = phraseIndex[phrase] || [];
    if (!ayahIds.length) continue;

    const filtered = candidateAyahIds ? ayahIds.filter((id) => candidateAyahIds.includes(id)) : ayahIds;
    if (!filtered.length) continue;

    const confidence = phrase.split(' ').length === 3 ? 0.88 : 0.72;
    if (confidence > best.confidence) {
      best = { ayahId: filtered[0], confidence, source: 'global', phrase };
    }
  }

  return best;
}
